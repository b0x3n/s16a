# s16a

Rebuilt the __s16__ assembler - added some features including
__help__ and __coloured output__.

The assembler and linker are no longer separate applications,
we can run __s16a__ in two modes, __build__ (default) or
__assemble__ modes.

The assemble mode allows us to assemble and merge objects
and write them to an output file.

Build mode allows us to link a combination of source and
object files into an __s16__ executable.

The binaries produced are not compatible with the current
version of s16:

    https://b0x3n.github.io/system16

So I'm re-building the front end to take advantage of some
of the new features.

Will update soon.

