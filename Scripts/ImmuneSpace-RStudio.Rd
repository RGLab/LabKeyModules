\name{ImmuneSpace-RStudio}
\title{Welcome to ImmuneSpace RStudio Session}
\section{Instantiate a connection}{
We can create a connection to the Data Finder:

\code{con <- CreateConnection("")}

Any filters applied in ImmuneSpace will be applied to data accessed through the connection.

Or we can create a connection to a specific study by passing a Study ID:

\code{sdy269 <- CreateConnection("SDY269")}
}
\section{Fetching datasets}{
\code{hai <- sdy269$getDataset("hai")}
}
\section{Fetching expression matrices}{
\code{laiv2008 <- sdy269$getGEMatrix("SDY269_PBMC_LAIV_Geo")}
}
\section{Plotting}{
\code{sdy269$plot("elisa")}
}
\section{More help}{
\itemize{
\item{\url{https://rglab.github.io/ImmuneSpaceR/}}
\item{\code{help(package="ImmuneSpaceR")}}
}
}
