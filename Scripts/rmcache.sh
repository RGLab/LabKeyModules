# remove cache folder in all studies
for study in /share/files/Studies/SDY*
do
  if [ -d "${study}/@files/cache" ]; then
    echo "rm -r  ${study}/@files/cache"
    rm -r ${study}/@files/cache
  fi
done

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

