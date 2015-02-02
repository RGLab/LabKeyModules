# remove cache folde in all studies
for study in /share/files/Studies/SDY*
do
  if [ -d "${study}/@files/cache" ]; then
    echo "rm -r  ${study}/@files/cache"
    rm -r ${study}/@files/cache
  fi
done

