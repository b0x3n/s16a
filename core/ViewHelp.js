///////////////////////////////////////////////////////////
//  ViewHelp/ViewHelp.js                                 //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  Import dependencies.                                 //
///////////////////////////////////////////////////////////
//
    import { LoadFile } from            "./LoadFile.js";
    import { Tokeniser } from           "./Tokeniser.js";
    //import { TermColour } from          "./TermColour/TermColour.js";


///////////////////////////////////////////////////////////
//  These keywords are used in the index file.
//
    const   __VIEWHELP_USEANSICOLOURS   = 'USEANSICOLOURS';
    const   __VIEWHELP_COMMAND          = 'COMMAND';
    const   __VIEWHELP_TITLE            = 'TITLE';
    const   __VIEWHELP_DESCRIPTION      = 'DESCRIPTION';
    const   __VIEWHELP_OPTION           = 'OPTION';
    const   __VIEWHELP_SWITCH           = 'SWITCH';
    const   __VIEWHELP_DETAIL           = 'DETAIL';
    const   __VIEWHELP_ADDITIONAL       = 'ADDITIONAL';


///////////////////////////////////////////////////////////
//  The ViewHelp module.                                 //
///////////////////////////////////////////////////////////
//
    export const    ViewHelp            = (

        index_path,
        output_callback                 = console.log

    ) =>
    {

        const   __tokeniser             = Tokeniser(false, false);

        let     __command               = 'Command name';
        let     __title                 = 'Application title';
        let     __description           = 'Application description';

        const   __options               = {};
        const   __switches              = {};

        const   __detail                = {};
        const   __additional            = {};


///////////////////////////////////////////////////////////
//  __process_option()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_option        = tokens =>
        {

    //  Requires 4 additional parameters.
    //
            if (tokens.length != 7)
                return `Error in file ${tokens[0]}, line ${tokens[1]}: OPTION expects exactly four parameters`;

    //  Make sure the option name isn't already in use.
    //
            if (__options.hasOwnProperty(tokens[3]))
                return `Error in file ${tokens[0]}, line ${tokens[1]}: Option '${tokens[3]}' already defined`;
            if (__switches.hasOwnProperty(tokens[3]))
                return `Error in file ${tokens[0]}, line ${tokens[1]}: Switch '${tokens[3]}' already defined`;
            
            __options[tokens[3]] = {};

            __options[tokens[3]]['option'] = tokens[4].replace('%option', tokens[3]);
            __options[tokens[3]]['usage'] = tokens[5].replace('%command', __command);
            __options[tokens[3]]['description'] = tokens[6];

            return true;

        };


///////////////////////////////////////////////////////////
//  __process_switch()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_switch        = tokens =>
        {

    //  Requires 4 additional parameters.
    //
            if (tokens.length != 7)
                return `Error in file ${tokens[0]}, line ${tokens[1]}: SWITCH expects exactly four parameters`;

    //  Make sure the option name isn't already in use.
    //
            if (__options.hasOwnProperty(tokens[3]))
                return `Error in file ${tokens[0]}, line ${tokens[1]}: Option '${tokens[3]}' already defined`;
            if (__switches.hasOwnProperty(tokens[3]))
                return `Error in file ${tokens[0]}, line ${tokens[1]}: Switch '${tokens[3]}' already defined`;
            
            __switches[tokens[3]] = {};

            __switches[tokens[3]]['switch'] = tokens[4].replace('%switch', tokens[3]);
            __switches[tokens[3]]['usage'] = tokens[5].replace('%command', __command);;
            __switches[tokens[3]]['description'] = tokens[6];

            return true;

        };


///////////////////////////////////////////////////////////
//  __process_detail()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_detail        = tokens =>
        {
            
    //  We need at least 2 parameters.
    //
            if (tokens.length < 5)
                return `Error in file ${tokens[0]}, line ${tokens[1]}: DETAIL expects at least two parameters`;

    //  The first parameter must match the name of an
    //  existing option or switch.
    //
            if (
                (! __options.hasOwnProperty(tokens[3]))     &&
                (! __switches.hasOwnProperty(tokens[3]))
            )
                return `Error in file ${tokens[0]}, line ${tokens[1]}: '${tokens[3]}' is not a known switch or option`;
            
    //  If the second parameter is the keyword PATH then
    //  we expect an additional parameter which points to
    //  a file containing the data.
    //
            if (tokens[4] === 'PATH')
            {
                if (tokens.length !== 6)
                    return `Error in file ${tokens[0]}, line ${tokens[1]}: DETAIL ${tokens[3]} PATH requires a file name`;

                const   _objFileInfo    = LoadFile(tokens[5].replace('%option', tokens[3]));

                if (typeof _objFileInfo === 'string')
                    return _objFileInfo;

                __detail[tokens[3]] = _objFileInfo.data;
            }
            else
                __detail[tokens[3]] = tokens[4];
            
            return true;

        };


///////////////////////////////////////////////////////////
//  __process_additional()                               //
///////////////////////////////////////////////////////////
//
        const   __process_additional    = tokens =>
        {

            let     __additional_data   = '';

            if (tokens.length < 6)
                return `Error in file ${tokens[0]}, line ${tokens[1]}: ADDITIONAL expects at least three parameters`;

            if (tokens[5] === 'PATH')
            {
                if (tokens.length !== 7)
                    return `Error in file ${tokens[0]}, line ${tokens[1]}: ADDITIONAL ${tokens[3]} PATH requires a file name`;

                const   _objFileInfo    = LoadFile(tokens[6].replace('%option', tokens[3]));

                if (typeof _objFileInfo === 'string')
                    return _objFileInfo;

                __additional_data = _objFileInfo.data;
            }
            else
                __additional_data = tokens[5];

            __additional[tokens[3]]     =
            {
                'data':                 __additional_data,
                'description':          tokens[4]
            };

        };


///////////////////////////////////////////////////////////
//  __initialise()                                       //
///////////////////////////////////////////////////////////
//
        const   __initialise            = () =>
        {

    //  Load and tokenise the index file.
    //
            const   _objFileInfo        = LoadFile(index_path);
            const   __parent_directory  = process.cwd();

            if (typeof _objFileInfo === 'string')
                return _objFileInfo;
            
            const   _lines              = __tokeniser.get_tokens(
                _objFileInfo.data,
                _objFileInfo.path,
                true
            );

            if (typeof _lines.type === 'object' && _lines.type === 'error')
                return `Error in file ${_objFileInfo.path}, line ${_lines.line}: ${_lines.data}`;

            process.chdir(_objFileInfo.dir);

            for (let line_no = 0; line_no < _lines.length; line_no++)
            {

                const   _tokens         = _lines[line_no];

    //  Tokens 0 and 1 contain the file name and line
    //  number, respectively - less than 3 tokens is
    //  an empty line.
    //
                if (_tokens.length < 3)
                    continue;

    //  Enable ANSI colours and attributes.
    //
                if (_tokens[2] === __VIEWHELP_USEANSICOLOURS)
                {
                    objConfigure.CMD_ENABLE = true;
                    continue;
                }

    //  Get the command name.
    //
                if (_tokens[2] === __VIEWHELP_COMMAND)
                {
                    if (_tokens.length !== 4)
                        return `Error in file ${_tokens[0]}, line ${_tokens[1]}: COMMAND option expects exactly one parameter`;

                    __command_name = _tokens[3];

                    continue;
                }

    //  Get the title string - this is displayed
    //  on every page.
    //
                if (_tokens[2] === __VIEWHELP_TITLE)
                {
                    if (_tokens.length !== 4)
                        return `Error in file ${_tokens[0]}, line ${_tokens[1]}: TITLE option expects exactly one parameter`;

                    __title = _tokens[3];

                    continue;
                }

    //  Set the application description, this is shown when
    //  _view() is used without any arguments.
    //
                if (_tokens[2] === __VIEWHELP_DESCRIPTION)
                {
                    if (_tokens.length !== 4)
                        return `Error in file ${_tokens[0]}, line ${_tokens[1]}: DESCRIPTION option expects exactly one parameter`;

                    __description = _tokens[3];

                    continue;
                }

    //  Set an option.
    //
                if (_tokens[2] === __VIEWHELP_OPTION)
                {
                    const   _response   = __process_option(_tokens);

                    if (typeof _response === 'string')
                        return _response;

                    continue;
                }

    //  Set a switch.
    //
                if (_tokens[2] === __VIEWHELP_SWITCH)
                {
                    const   _response   = __process_switch(_tokens);

                    if (typeof _response === 'string')
                        return _response;

                    continue;
                }

    //  Set option/switch detail.
    //
                if (_tokens[2] === __VIEWHELP_DETAIL)
                {
                    const   _response   = __process_detail(_tokens);

                    if (typeof _response === 'string')
                        return _response;

                    continue;
                }


                if (_tokens[2] === __VIEWHELP_ADDITIONAL)
                {
                    const   _response   = __process_additional(_tokens);

                    if (typeof _response === 'string')
                        return _response;

                    continue;
                }

                return `Error in file ${_tokens[0]}, line ${_tokens[1]}: Unexpected token |${_tokens[2]}|`;

            }

            process.chdir(__parent_directory);

        };


        const   __calculate_largest     = (

            options,
            switches,
            additional

        ) =>
        {

            let     _largest            = 0;

            options.forEach(__option => {
                if (__option.length > _largest)
                    _largest            = __option.length;
            });

            switches.forEach(__switch => {
                if (__switch.length > _largest)
                    _largest            = __switch.length;
            });

            additional.forEach(__add => {
                if (__add.length > _largest)
                    _largest            = __add.length;
            });

            return _largest;

        };


        const   __pad_output            = (

            output_string,
            pad_length,
            pad_char                    = ' '

        ) =>
        {

            let _output_string          = '';

            for (let byte_no = output_string.length; byte_no < (pad_length + 2); byte_no++)
                _output_string += pad_char;

            return _output_string;

        };


        const   _help                   = (
            
            option                      = false
        
        ) =>
        {

            const   _options            = Object.keys(__options);
            const   _switches           = Object.keys(__switches);
            const   _additional         = Object.keys(__additional);

            const   __largest           = __calculate_largest(_options, _switches, _additional);

            output_callback(`\n${__title}`);

            if (option !== false)
                output_callback(` --help <!<bold>!>${option}<!<bold>!>\n\n\n`);
            else
                output_callback(`\n\n\n`)

            if (option === false)
            {
                if (_options.length)
                {
                    output_callback(`  Options:\n\n`);

                    _options.forEach(__option => {
                        output_callback(`${__options[__option]['option']} ${__pad_output(__option, __largest)}${__options[__option]['description']}\n`);
                    });

                    output_callback('\n\n');
                }
                if (_switches.length)
                {
                    output_callback(`  Switches:\n\n`);

                    _switches.forEach(__switch => {
                        output_callback(`${__switches[__switch]['switch']}  ${__pad_output(__switch, __largest)}${__switches[__switch]['description']}\n`);
                    });

                    output_callback('\n\n');
                }
                if (_additional.length)
                {
                    output_callback(`  Additional:\n\n`);

                    _additional.forEach(__add => {
                        output_callback(`    <!<bold>!>${__add}<!<reset>!>  ${__pad_output(__add, __largest)}${__additional[__add]['description']}\n`);
                    });

                    output_callback('\n');
                }
                

                output_callback(`${__description}\n`);
            }
            else
            {
                let __option            = false;
                let __usage             = false;
                let __description       = false;
                let __details           = false;
                let __prefix            = '-';

                if (__options.hasOwnProperty(option))
                {
                    __prefix            = '--';
                    __option            = __options[option]['option'];
                    __usage             = __options[option]['usage'];
                    __description       = __options[option]['description'];
                    __details           = __detail[option].replace('%command', __command).replace('%option', option);;
                }
                else if (__switches.hasOwnProperty(option))
                {
                    __option            = __switches[option]['switch'];
                    __usage             = __switches[option]['usage'];
                    __description       = __switches[option]['description'];
                    __details           = __detail[option].replace('%command', __command).replace('%switch', option);
                }
                else if (__additional.hasOwnProperty(option))
                {
                    output_callback(`${__additional[option].data}\n`);
                    return false;
                }

                if (__option === false)
                {
                    output_callback(`<!<fg red>!>Error<!<reset>!>: <!<bold>!>${option}<!<bold>!> is not a known option or switch\n`);
                    return false;
                }

                output_callback(`  Summary:\n\n    ${__description}\n\n\n  Usage:\n\n    ${__usage}\n\n\n  Description:\n\n${__details}\n`);
            }

            return true;

        };


        const   __response              = __initialise();

        if (typeof __response === 'string')
            return __response;


        return {

            dump:                       {
                __title,
                __description,
                __options,
                __switches,
                __detail
            },

            help:                       _help

        };

    };

