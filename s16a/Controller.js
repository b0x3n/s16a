///////////////////////////////////////////////////////////
//  System16/s16a/Controller.js                          //
///////////////////////////////////////////////////////////
//
//  Controller for the s16 assembler.
//

    import * as path from               'path';
    import * as fs from                 'fs';


    import { fileURLToPath } from 'url';
    import { dirname } from 'path';


    import { TermColour } from          "./../core/TermColour.js";
    import { ConfigCLI } from           "./../core/ConfigCLI.js";
    import { ViewHelp } from            "./../core/ViewHelp.js";


    import { cfgTermColour } from       "./config/cfgTermColour.js";
    import { cfgParameters } from       "./config/cfgParameters.js";

    import * as GlobalColours from      "./../core/defs/Colours.js"

    import { Assembler } from           "./core/Assembler.js";
    import { Merger } from              "./core/Merger.js";
    import { Linker } from              "./core/Linker.js";


///////////////////////////////////////////////////////////
//  The main Controller module.                          //
///////////////////////////////////////////////////////////
//
    export const    Controller          = () =>
    {


    ///////////////////////////////////////////////////////
    //  Allows us to embed <!< tags >!> in output strings,
    //  we can use simple command to change colours
    //  and attributes on the console - e.g:
    //
    //      __termColour.print(`<!<fg red; bold>!>Red and bold<!<reset>!>`);
    //
        let     __termColour            = TermColour(cfgTermColour);

    ///////////////////////////////////////////////////////
    //  The ConfigCLI module will process command-line
    //  arguments and populate this object.
    //
        let     _objConfigure;


        let     __viewHelp;


        let     __assembler;
        let     __merger;


///////////////////////////////////////////////////////////
//  __help()                                             //
///////////////////////////////////////////////////////////
//
        const   __help                  = () =>
        {

            if (process.argv.length > 3 && process.argv[3] === 'nocolour')
            {
                cfgTermColour.CMD_ENABLE = false;
                __termColour = TermColour(cfgTermColour);
                process.argv.splice(3, 1);
            }

            if (process.argv.length === 3)
                __viewHelp.help();
            else
            {
                for (let argc = 3; argc < process.argv.length; argc++)
                    __viewHelp.help(process.argv[argc].replace(/[-]/g, ''));
            }

        };


///////////////////////////////////////////////////////////
//  __initialise_globals()                               //
///////////////////////////////////////////////////////////
//
        const   __initialise_globals    = () =>
        {
            
            global.__s16_error          = error_message =>
            {
                __termColour.print(`<!<fg red; bold>!>Error<!<reset>!>: ${error_message}`);
                process.exit(1);
            };

            global.__s16_file_error     = (

                tokens,
                error_message

            ) =>
            {
                __termColour.print(`<!<fg red; bold>!>Error<!<reset>!> in file ${global.__s16a_file(tokens[0])}, line ${global.__s16a_number(tokens[1])}: ${error_message}`);
                process.exit(1);
            };

            global.__s16_warning        = warning_message =>
            {
                if (_objConfigure.hasOwnProperty('w') && _objConfigure['w'])
                    __termColour.print(`<!<fg red>!>Warning<!<reset>!>: ${warning_message}`);
                if (_objConfigure.hasOwnProperty('e') && _objConfigure['e'])
                    process.exit(1);
            };

            global.__s16_verbose        = verbose_message =>
            {
                if (_objConfigure.hasOwnProperty('v') && _objConfigure['v'])
                    __termColour.print(verbose_message);
            };

            global.__s16_filename       = fileURLToPath(import.meta.url);
            global.__s16_dirname        = dirname(global.__s16_filename);

        };


///////////////////////////////////////////////////////////
//  __check_config()                                     //
///////////////////////////////////////////////////////////
//
        const   __check_config          = () =>
        {

            const   __model             = _objConfigure['model'];
            const   __regsize           = parseInt(_objConfigure['regsize']);
            const   __maxaddr           = parseInt(_objConfigure['maxaddr']);

            console.log(`>>> __model = ${__model}`)

            if (global.S16_MODELS.indexOf(__model) < 0)
                global.__s16_error(`'<!<bold>!>${__model}<!<reset>!>' is not a valid model`);
            _objConfigure[global.S16_HEADER_MODEL] = global.S16_MODELS.indexOf(__model);

    //  Regsize may only be 1, 2 or 4.
    //
            if (global.S16_REGSIZES.indexOf(parseInt(__regsize)) < 0)
                global.__s16_error(`${global.__s16a_number(__regsize)} is not a valid register size`);

    //  The maxaddr may not be less than 0xFF or greater
    //  than 0xFFFFFFFF
    //
            if (__maxaddr < global.S16_MAXADDR_MIN || __maxaddr > global.S16_MAXADDR_MAX)
                global.__s16_error(`'${global.__s16a_number(__maxaddr)}' must be in the range ${global.S16_MAXADDR_MIN} - ${global.S16_MAXADDR_MAX}`);

    //  The register size must be large enough to store
    //  __maxaddr.
    //
    //  So if __maxaddr is 0xFF then __regsize can be
    //  1, 2 or 4 bytes. But if __maxaddr is 0xFFFF then
    //  __regsize must be at least 2, if __maxaddr is
    //  0xFFFFFFFF then it needs to be 4.
    //
            if (
                (__maxaddr > global.S16_MAXADDR_MIN && __regsize < 2)   ||
                (__maxaddr > global.S16_MAXADDR_MAX && __regsize < 4)
            )
                global.__s16_error(`The <!<bold>!>maxaddr<!<bold>!> value ${global.__s16a_number(__maxaddr)} is too big to fit in <!<bold>!>regsize<!<bold>!> ${global.__s16a_number(__regsize)}`);

        };


///////////////////////////////////////////////////////////
//  __initialise()                                       //
///////////////////////////////////////////////////////////
//
        const   __initialise            = () =>
        {

            __initialise_globals();

            __viewHelp                  = ViewHelp(
                `${global.__s16_dirname}${path.sep}doc${path.sep}index`,
                __termColour.print
            );

            if (typeof __viewHelp === 'string')
                global.__s16_error(__viewHelp);

            if (process.argv.length > 2 && process.argv[2] === '--help')
                return __help();

    //  objParameters terlls the ConfigCLI module what
    //  parameters to expect and what type of data
    //  they expect.
    //
            const   __configCLI         = ConfigCLI(cfgParameters);

            if (typeof __configCLI === 'string')
                global.__s16_error(__configCLI);

    //  The build_object() method will build and return
    //  the config object based on the given array - in
    //  this case the command-line arguments.
    //
            _objConfigure               = __configCLI.build_object(process.argv);

            if (typeof _objConfigure === 'string')
                global.__s16_error(_objConfigure);

            _objConfigure               = __configCLI.objConfig;

            __check_config();

            __assembler                 = Assembler(_objConfigure);
            __merger                    = Merger();

            if (_objConfigure.mode !== 'assemble' && _objConfigure.mode !== 'build')
                global.__s16_error(`<!<bold>!>${_objConfigure.mode}<!<reset>!>' is not a valid mode`);

    //  Disable colour output?
    //
            if (_objConfigure['c'] === false)
            {
    //  Disabled.
                cfgTermColour.CMD_ENABLE = false;
                __termColour = TermColour(cfgTermColour);
            }

            global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> The ${global.__s16a_title('s16')} assembler (${global.__s16a_title('s16a')})<!<fg blue>!> -+<!<reset>!>\n\n`);

    //  Now we'll do some basic checks, do we have any
    //  assembly input files? If so they need to be
    //  assembled first...
    //
            if (_objConfigure.asm.length === 0)
            {
    //  If we have no assembly input files, we should have
    //  some object files to merge...
    //
                if (_objConfigure.obj.length === 0)
                    global.__s16_error(`No input files`);
    //  We can't merge only one object file, the output
    //  would be the exact same as the input...it'd
    //  be pointless.
    //
                if (_objConfigure.obj.length === 1 && _objConfigure['mode'] === 'assemble')
                    global.__s16_error(`Attempt to merge a single object file`);
            }
            else
            {
                __assembler.assemble(_objConfigure.asm);
                __dump_object(__assembler.sections);
            }

            if (_objConfigure.obj.length)
            {
                const   __is_verbose    = _objConfigure['v'];

    //  If linking a single object file then it still
    //  needs to be run through the merger. The output
    //  is meaningless since the output is the same
    //  as the input, nothing will be printed to
    //  the console.
    //
                if (_objConfigure.obj.length === 1)
                    _objConfigure['v'] = false;

                __merger.merge(
                    __assembler.asm_paths,
                    _objConfigure.obj,
                    __assembler.objSections
                );

                global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Done - merged ${global.__s16a_number(_objConfigure.obj.length)} object files:\n<!<fg blue>!>|<!<reset>!>\n`)
                __dump_object(__assembler.sections);

                if (_objConfigure.obj.length === 1)
                {
                    if (__is_verbose)
                        _objConfigure['v'] = true;
                }
            }

            if (_objConfigure.mode === 'assemble')
            {

                global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Writing object to output file ${global.__s16a_file(_objConfigure.out)}...\n<!<fg blue>!>|<!<reset>!>`);

                fs.writeFileSync(
                    _objConfigure.out,
                    JSON.stringify(__assembler.sections),
                    {
                        'encoding':     'utf-8'
                    }
                );

                global.__s16_verbose(`\n<!<fg blue>!>+<!<reset>!> Done.`);
                process.exit(0);
            }

    //  If it gets to this point we're running in build
    //  mode - the object is linked into an executable.
    //
            const   __linker            = Linker(__assembler);

            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> <!<bold>!>linking<!<reset>!> complete, writing ${global.__s16a_title('s16')} executable ${global.__s16a_file(_objConfigure['out'])} ...\n<!<fg blue>!>|<!<reset>!>\n`);

            fs.writeFileSync(
                _objConfigure.out,
                Buffer.from(__linker.objExe.buffer),
                {
                    'encoding':     'utf-8',
                    'flag':         'w'
                }
            );

            global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Done`);

        };


///////////////////////////////////////////////////////////
//  __dump_object()                                      //
///////////////////////////////////////////////////////////
//
        const   __dump_object           = sections =>
        {

            let     __total_bytes       = 0;
            let     __total_lines       = 0;

            const   __model             = __assembler.objSections.find(global.S16_HEADER_MODEL);
            const   __maxaddr           = __assembler.objSections.find(global.S16_HEADER_MAXADDR);
            const   __regsize           = __assembler.objSections.find(global.S16_HEADER_REGSIZE);
            const   __endianess         = __assembler.objSections.find(global.S16_HEADER_BYTEORDER);

            let     __byte_order        = 'big-endian';

            if (__endianess.data[0] === 0xFF)
                __byte_order            = 'little-endian';

            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> ${global.__s16a_section(global.S16_SECTION_HEADER)}:\n`);
            
            if (typeof __model === 'object');
                global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> ${global.S16_HEADER_MODEL}: ${global.__s16a_keyword(global.S16_MODELS[__model.data[0]])}\n`);
            if (typeof __maxaddr === 'object');
                global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> ${global.S16_HEADER_MAXADDR}: ${global.__s16a_number(__maxaddr.data[0])}\n`);
            if (typeof __regsize === 'object');
                global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> ${global.S16_HEADER_REGSIZE}: ${global.__s16a_number(__regsize.data[0])}\n`);
            if (typeof __endianess === 'object');
                global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> ${global.S16_HEADER_BYTEORDER}: ${global.__s16a_keyword(__byte_order)}\n`);

            for (let section_no = 1; section_no < global.S16_SECTIONS.length; section_no++)
            {
                global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> ${global.__s16a_section(global.S16_SECTIONS[section_no])} section: ${global.__s16a_number(sections[section_no].section.label.length)} entries, ${global.__s16a_number(sections[section_no].section.total_length)} total bytes.\n`);
                __total_bytes += sections[section_no].section.total_length;
            }

            global.__s16_verbose(`<!<fg blue>!>|\n+-<!<reset>!> Assembled object, ${global.__s16a_number(__total_bytes)} total bytes.\n<!<fg blue>!>|<!<reset>!>\n`);

        };

        __initialise();

    };

