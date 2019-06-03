# remove cache folder in every study
for study in /share/files/Studies/SDY*
do
  if [ -d "${study}/@files/cache" ]; then
    echo "rm -r  ${study}/@files/cache"
    rm -r ${study}/@files/cache
  fi

  # Remove SDY207 manually cached files to avoid stale report
  if [ -d "SDY207/@files/analysis/gating_set" ]; then
    echo "rm -r ${study}/@files/analysis/gating_set*"
    rm -r ${study}/@files/analysis/gating_set
    rm -r ${study}/@files/analysis/gating_set_gated 
  fi
done

# Remove HIPC ISx caches for R reports
for study in /share/files/HIPC/IS*
do
  if [ -d "${study}/@files/cache" ]; then
    echo "rm -r  ${study}/@files/cache"
    rm -r ${study}/@files/cache
  fi
done

if [ -d "/share/files/Studies/@files/cache" ]; then
    echo "rm -r /share/files/Studies/@files/cache"
    rm -r /share/files/Studies/@files/cache
fi


