///////////////////////////////////////////////////////////
//  System16/core/defs/Keywords.js                       //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  Import defs.                                         //
///////////////////////////////////////////////////////////
//
//  All keywords are already defined across other files
//  in the System16/core/defs/ directory.
//
//  E.g the directives are defined in:
//
//      System16/core/defs/Directives.js
//
//  All of these files are imported here and all keywords
//  are added to the S16_KEYWORDS array - this is just for
//  quick checking.
//


    import * as GlobalDirectives from   "./../../core/defs/Directives.js";
    import * as GlobalSections from     "./../../core/defs/Sections.js";
    import * as GlobalMemtypes from     "./../../core/defs/Memtypes.js";
    import * as GlobalMnemonics from    "./../../core/defs/Mnemonics.js";
    import * as GlobalHeader from       "./../../core/defs/Header.js";
    import * as GlobalRegisters from    "./../../core/defs/Registers.js";


///////////////////////////////////////////////////////////
//  A few keywords are defined right here.
//
    global.S16_KEYWORD_FUNCTION         = 'function';
    global.S16_KEYWORD_END              = 'end';
    global.S16_KEYWORD_MAIN             = '_main';


///////////////////////////////////////////////////////////
//  Every keyword is added here.
//
    global.S16_KEYWORDS                 =
    [

        global.S16_KEYWORD_FUNCTION,
        global.S16_KEYWORD_END,
        global.S16_KEYWORD_MAIN,


    ///////////////////////////////////////////////////////
    //  Directives.
    //
        ... global.S16_DIRECTIVES,


    ///////////////////////////////////////////////////////
    //  Sections.
    //
        ... global.S16_SECTIONS,


    ///////////////////////////////////////////////////////
    //  Memtypes.
    //
        ... global.S16_MEMTYPES,


    ///////////////////////////////////////////////////////
    //  Registers.
    //
        ... Object.keys(global.S16_REGISTERS),


    ///////////////////////////////////////////////////////
    //  Mnemonics.
    //
        ... Object.keys(global.S16_MNEMONICS)

    ];

