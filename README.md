# iOS Icon Util
This is a node.js based command-line tool to make your iOS development life a little easier.
With passing in your icon image, it will generate all size of icon images and launch images for you.

----

# Getting Started
This is tool is based on [ImageMagick](http://www.imagemagick.org/).

```
brew install imagemagick
```

Then, you need node environment.

```
brew install node
```

And prepare a icon image with 1024 * 1024 dimension. 
You could find example inside ex folder.

# Examples

* Generate all icons:

```
node logoUtil.js -icon:YOUR_ICON.PNG
```

* Generate all launch images with background:

```
node logoUtil.js -launch:YOUR_ICON.PNG -color:#ffffff
```

* Generate landscape launch images:

```
node logoUtil.js -launch:YOUR_ICON.PNG -color:#ffffff -l
```

* Specified ouput folder:

```
node logoUtil.js -icon:YOUR_ICON.PNG -output:OUTPUT_DIR
```
