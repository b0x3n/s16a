///////////////////////////////////////////////////////////
//  System16/core/defs/Header.js                         //
///////////////////////////////////////////////////////////
//
//
//


    global.S16_HEADER_MODEL             = 'model';

        global.S16_MODELS               =
        [
            'flat',
            'split',
            'multi'
        ];


    global.S16_HEADER_REGSIZE           = 'regsize';

        global.S16_REGSIZES             =
        [
            1,
            2,
            4
        ];


    global.S16_HEADER_MAXADDR           = 'maxaddr';

        global.S16_MAXADDR_MIN          = 0xFF;
        global.S16_MAXADDR_MAX          = 0xFFFFFFFF;


    global.S16_HEADER_BYTEORDER         = 'byteorder';

        global.S16_BYTEORDER_LE         = [ 0xFF, 0x00 ];
        global.S16_BYTEORDER_BE         = [ 0x00, 0xFF ];


    global.S16_OFFSET_DAY               = 6;
    global.S16_OFFSET_MONTH             = 7;
    global.S16_OFFSET_YEAR              = 8;

    global.S16_OFFSET_MAJOR             = 10;
    global.S16_OFFSET_MINOR             = 11;

    global.S16_OFFSET_MODEL             = 12;
    global.S16_OFFSET_REGSIZE           = 13;
    global.S16_OFFSET_MAXADDR           = 14;
    global.S16_OFFSET_BYTEORDER         = 18;

    global.S16_OFFSET_EXESIZE           = 20;
    global.S16_OFFSET_MAIN              = 24;
    