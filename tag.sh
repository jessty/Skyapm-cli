tag=$(npm version $1)
git add .
git commit -m 'tag: $tag'
git push origin master
git tag -a "$tag" -m 'tag: $tag'
git push origin $tag
npm publish
exit $?
