///////////////////////////////////////////////////////////
//  System16/core/defs/Registers.js                      //
///////////////////////////////////////////////////////////
//
//
//

    global.S16_REGISTER_OFFSET          = 80;


    global.S16_REGISTER_ROS             = 'ROS';
    global.S16_REGISTER_RWS             = 'RWS';
    global.S16_REGISTER_CS              = 'CS';

    global.S16_REGISTER_ROO             = 'ROO';
    global.S16_REGISTER_RWO             = 'RWO';
    global.S16_REGISTER_CO              = 'CO';

    global.S16_REGISTER_BP              = 'BP';
    global.S16_REGISTER_IP              = 'IP';
    global.S16_REGISTER_SP              = 'SP';

    global.S16_REGISTER_HB              = 'HB';
    global.S16_REGISTER_HP              = 'HP';

    global.S16_REGISTER_OI              = 'OI';
    global.S16_REGISTER_II              = 'II';

    global.S16_REGISTER_FL              = 'FL';
    global.S16_REGISTER_RT              = 'RT';

    global.S16_REGISTER_AX              = 'AX';
    global.S16_REGISTER_BX              = 'BX';
    global.S16_REGISTER_CX              = 'CX';
    global.S16_REGISTER_DX              = 'DX';
    global.S16_REGISTER_EX              = 'EX';
    global.S16_REGISTER_FX              = 'FX';


///////////////////////////////////////////////////////////
//  If the size of the register is 0 then that registers
//  will be regsize bytes - regsize is set at the
//  command-line:
//
//      node s16a --regsize 4       // 4-byte registers
//
//  The default regsize is 2.
//
    global.S16_REGISTERS                =
    {

        [global.S16_REGISTER_ROS]:      0,
        [global.S16_REGISTER_RWS]:      0,
        [global.S16_REGISTER_CS]:       0,

        [global.S16_REGISTER_ROO]:      0,
        [global.S16_REGISTER_RWO]:      0,
        [global.S16_REGISTER_CO]:       0,

        [global.S16_REGISTER_BP]:       0,
        [global.S16_REGISTER_IP]:       0,
        [global.S16_REGISTER_SP]:       0,

        [global.S16_REGISTER_HB]:       0,
        [global.S16_REGISTER_HP]:       0,
        
        [global.S16_REGISTER_OI]:       1,
        [global.S16_REGISTER_II]:       1,
        
        [global.S16_REGISTER_FL]:       1,
        [global.S16_REGISTER_RT]:       1,
        
        [global.S16_REGISTER_AX]:       0,
        [global.S16_REGISTER_BX]:       0,
        [global.S16_REGISTER_CX]:       0,
        [global.S16_REGISTER_DX]:       0,
        [global.S16_REGISTER_EX]:       0,
        [global.S16_REGISTER_FX]:       0,

    };


    global.S16_REGOFFSETS               = regsize =>
    {

        let     _regOffsets             = {}
        let     _regbuf_length          = 0;

        Object.keys(global.S16_REGISTERS).forEach(key => {

            let     __regsize           = global.S16_REGISTERS[key];

            if (__regsize === 0)
                __regsize = regsize;

            _regOffsets[key]            = (global.S16_REGISTER_OFFSET + _regbuf_length);

            _regbuf_length += __regsize;

        });

        _regOffsets['regbuf_length'] = _regbuf_length;

        return _regOffsets;

    };
