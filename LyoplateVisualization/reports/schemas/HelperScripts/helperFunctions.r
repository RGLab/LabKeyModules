.reorder.factor<-function(x,neworder=c("Sample","Center","Residual")){
  x<-x[order(factor(x$variable,levels=neworder),decreasing=FALSE),]
  x$variable<-factor(x$variable,levels=neworder)
  x
}
.extractVcomp<-function(mer,sd=FALSE){
  vc<-melt(ldply(mer,function(x){
    if(!sd){
      foo<-as.data.frame(VarCorr(x))[,5]^2
    }else{
      foo<-as.data.frame(VarCorr(x))[,5]
    }
    names(foo)<-as.data.frame(VarCorr(x))[,1]
    #names(foo)<-print(VarCorr(x))[,1]
    foo
  }),id=c("Method","Population"))
  vc
}
.fitMer<-function(TBL){
  mer<-dlply(TBL,.(Method,Population),function(x){
    fit<-lmer(lp~1+(1|Center)+(1|Sample),x,REML=FALSE,verbose=FALSE) #Model biological and center to center variability
    #x$Residual<-1:nrow(x);
    #fit<-glmer(Proportion~1+(1|Center)+(1|Sample)+(1|Residual),x,weights = x$Count_Parent,family=binomial,verbose=FALSE) #Model biological and center to center variability
    fit
  })
  mer
}

.getCI<-function(mer){
  cb<-ldply(mer,function(x){
    # ci<-arm::invlogit(lme4::confint.merMod(x,method="Wald",oldNames=FALSE))
    ci<-lme4::confint.merMod(x,method="Wald",oldNames=FALSE)
    rn<-rownames(ci)
    data.frame(ci,rn)
  })
  setnames(cb,c("Method","Population","lower","upper","Sample"))
  # mns<-(ldply(mer,function(x)arm::invlogit(fixef(x))))
  mns<-(ldply(mer,function(x)(fixef(x))))
  cb<-data.table(cb)
  mns<-data.table(mns)
  mns<-data.table(melt(mns))
  setnames(mns,c("variable","value"),c("Sample","mean"))
  setkey(cb,Method, Population,Sample)
  setkey(mns,Method,Population,Sample)
  merge(cb,mns)
}

.fitMerBias<-function(TBL){
  mer<-dlply(TBL,.(Method,Population),function(x){
   # x$Residual<-1:nrow(x);
    fit<-lmer(lp~Sample+(1|Center),x,REML=FALSE,verbose=FALSE) #Model biological and center to center variability
    #fit<-glmer(Proportion~Sample+(1|Center)+(1|Residual),x,weights=x$Count_Parent,family=binomial,verbose=FALSE) #Model biological and center to center variability
    fit
  })
  mer
}
.transCI<-function(bar){
  foo<-ddply(cast(melt(bar),Method+Population+variable~Sample),.(Method,Population,variable),function(x)with(x,data.frame(Sample12828 = `(Intercept)`,Sample1349=`(Intercept)`+Sample1349,Sample1369=`(Intercept)`+Sample1369)))
  setnames(foo,"variable","ci")
  foo<-melt(foo)
  foo$value<-arm::invlogit(foo$value)
  foo<-setnames(foo,"variable","Sample")
  foo<-(cast(foo,Method+Population+Sample~ci))
  foo
}



.prepDF<-function(VV,CC,ratio){
  vars<-cast(VV)
  foo<-ddply(CC,.(Method,Population),function(x)with(x,data.frame(mean=mean(mean))))
  foo<-merge(vars,foo,by=c("Method","Population"))

  V1<-vars[,3:5]^2
  V2<-vars[,c(4:5)]^2


  S1<-sqrt(rowSums(2*V1))
  S2<-sqrt(rowSums(2*V2))
  popsz<-foo$mean

  vars$mean<-popsz
  vars$S1<-S1
  vars$S2<-S2
  foo<-melt(data.frame(vars[,c(1,2,6:8)]),id=c("Method","Population","mean"))

  samplesize<-c(5,10,20,25,50,75,100)
  setnames(foo,c("variable","value"),c("S.cat","S.value"))
  foo<-melt(cbind(foo,5,10,20,25,50,75,100),id.vars=c("Method","Population","mean","S.value","S.cat"))
  setnames(foo,c("variable","value"),c("SampleSize.cat","SampleSize.value"))

  #average automated gating central analysis
  #fix this for the new data
#   foo$Central<-factor(!foo$Method%in%"flowDensity","OpenCyto",levels=c("FALSE","TRUE"),labels=c("Central","Other"))
  foo<-subset(data.frame(foo),Method%in%"Manual")
  foo<-unique((ddply(foo,.(Population,S.cat,S.value,SampleSize.cat,SampleSize.value),function(x)with(x,data.frame(mean=mean(mean),S.value=mean(S.value))))))

  foo<-subset(foo,Population%in%ratio$Population)
  foo<-(ddply(foo,.(Population,SampleSize.cat,SampleSize.value,mean),function(x){
    with(x,{
      s1<-S.value[S.cat=="S1"]
      s2<-S.value[S.cat=="S2"]
      m<-as.character(ratio$Population)%in%unique(as.character(Population))
      if(sum(m)==0){
        r<-NA
      }else{
        r<-ratio[m,"var.ratio",with=FALSE]
      }
      s3<-sqrt(r*(s1^2-s2^2)+s2^2)
      names(s3)<-"S3"
      data.frame(S1=s1,S2=s2,S3=s3)
    })
  }))
  foo<-melt(foo,id=c("Population","SampleSize.cat","SampleSize.value","mean"))
  setnames(foo,c("variable","value"),c("S.cat","S.value"))
  require(parallel)
  cl<-makeCluster(4)
  clusterSetRNGStream(cl, 123)
  assign("foo",foo,.GlobalEnv)
  clusterExport(cl,list("foo",".power"))
  clusterEvalQ(cl,library(arm))
  clusterEvalQ(cl,library(boot))
  effects<-parSapply(cl,1:nrow(foo),function(x)with(foo,.power(SampleSize.value[x],S.value[x],mean[x])))
  stopCluster(cl)
  foo$effects<-effects
  foo
}

.power<-function(N=NA,S=NA,popsz=NA){
  f1<-function(x){set.seed(1);(mean(replicate(1000,mean(rnorm(N,mean=0,sd=S)))>x)-0.05)^2}
  thresh<-optim(0,f1)$par
  f2<-function(delta,thresh){set.seed(1);(mean(replicate(1000,mean(rnorm(N,mean=delta,sd=S)))>thresh)-0.8)^2}
  leffect<-optim(0,f2,thresh=thresh)$par
  invlogit(logit(popsz)+leffect)-popsz
}

.matchPops<-function(p1,p2){
  d<-adist(p1,p2)
  trans<-FALSE
  if(ncol(d)<=nrow(d))
    trans<-TRUE
  if(trans){
    d<-t(d)
  }
  mapping<-solve_LSAP(d)
  if(trans){
    l<-as.list(p2)
    names(l)<-p1[mapping]
  }else{
    l<-as.list(p2[mapping])
    names(l)<-p1
  }
  l
}
