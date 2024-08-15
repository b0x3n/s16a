///////////////////////////////////////////////////////////
//  System16/core/defs/Mnemonics.js                      //
///////////////////////////////////////////////////////////
//
//
//


    global.S16_MNEMONIC_END             = 'end';
    global.S16_MNEMONIC_INT             = 'int';
    global.S16_MNEMONIC_CALL            = 'call';
    global.S16_MNEMONIC_RET             = 'ret';


    global.S16_MNEMONIC_MOV8            = 'mov8';
    global.S16_MNEMONIC_MOV16           = 'mov16';
    global.S16_MNEMONIC_MOV32           = 'mov32';


    global.S16_MNEMONIC_JMP             = 'jmp';


    global.S16_MNEMONICS                =
    {

        [global.S16_MNEMONIC_END]:      {
                                            'opcode':       0x00,
                                            'params':       []
                                        },
        [global.S16_MNEMONIC_INT]:      {
                                            'opcode':       0x10,
                                            'params':       [ 2 ]
                                        },
        [global.S16_MNEMONIC_CALL]:     {
                                            'opcode':       0x11,
                                            'params':       [ 0 ]
                                        },
        [global.S16_MNEMONIC_RET]:      {
                                            'opcode':       0x12,
                                            'params':       [ 1 ]
                                        },


        [global.S16_MNEMONIC_MOV8]:     {
                                            'opcode':       0x40,
                                            'params':       [ 0, 1 ]
                                        },
        [global.S16_MNEMONIC_MOV16]:    {
                                            'opcode':       0x41,
                                            'params':       [ 0, 2 ]
                                        },
        [global.S16_MNEMONIC_MOV32]:    {
                                            'opcode':       0x42,
                                            'params':       [ 0, 4 ]
                                        },


        [global.S16_MNEMONIC_JMP]:      {
                                            'opcode':                   0x60,
                                            'params':                   [ 0 ]
                                        }

    };


    global.S16_OPCODE                   = opcode =>
    {

        let     _objMnemonic            = false;

        Object.keys(global.S16_MNEMONICS).forEach(
            key =>
            {

                if (_objMnemonic !== false)
                    return;

                if (opcode === global.S16_MNEMONICS[key]['opcode'])
                {
                    _objMnemonic = {
                        'opcode':       opcode,
                        'mnemonic':     key,
                        'params':       global.S16_MNEMONICS[key]['params']
                    };
                    return;

                }
            }
        );

        return _objMnemonic;

    };


    global.S16_ADDR_DIRECT              =
    [
        0b10000000,
        0b01000000,
        0b00100000,
        0b00010000
    ];


    global.S16_ADDR_INDIRECT            =
    [
        0b00001000,
        0b00000100,
        0b00000010,
        0b00000001
    ];

    