///////////////////////////////////////////////////////////
//  System16/s16a/core/Assembler.js                      //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  Import any required core modules.                    //
///////////////////////////////////////////////////////////
//
    import { LoadFile } from            "./../../core/LoadFile.js";
    import { Tokeniser } from           "./../../core/Tokeniser.js";


///////////////////////////////////////////////////////////
//  Include scripts from System16/core/defs/             //
///////////////////////////////////////////////////////////
//
//  Keywords.js will import everything needed - see:
//
//      System16/core/defs/Keywords.js
//
//  For more details.
//
    import * as GlobalKeywords from     "./../../core/defs/Keywords.js";


///////////////////////////////////////////////////////////
//  The Section module.                                  //
///////////////////////////////////////////////////////////
//
//  This is used to store the assembled section data.
//


///////////////////////////////////////////////////////////
//  Import s16a specific modules.                        //
///////////////////////////////////////////////////////////
//
    import { Sections } from            "./Sections.js";
    import { DataMapper } from          "./DataMapper.js";
    import { CodeMapper } from          "./CodeMapper.js";
    import { TokenFilters } from        "./TokenFilters.js";


///////////////////////////////////////////////////////////
//  The Assembler module.                                //
///////////////////////////////////////////////////////////
//
    export const    Assembler           = (

        objConfigure

    ) =>
    {

    ///////////////////////////////////////////////////////
    //  Need the Tokeniser - this parses the input file
    //  data into tokens for processing.
    //
        const   __tokeniser             = Tokeniser(false);


    ///////////////////////////////////////////////////////
    //  Remember the absolute path to every input file
    //  that is loaded and processed.
    //
        const   _asm_paths              = [];


    ///////////////////////////////////////////////////////
    //  Keep track of the include depth.
    //
        let     __include_depth         = 1;


    ///////////////////////////////////////////////////////
    //  A count of every byte and every line that is
    //  processed.
    //
        let     __total_bytes           = 0;
        let     __total_lines           = 0;


    ///////////////////////////////////////////////////////
    //  The goal is to process all input files and
    //  assemble them into a single object that can
    //  be linked into an executable.
    //
    //  That object data will be stored in the _sections
    //  array which has an element for every section.
    //

        const   _sections               = Sections();

        const   __tokenFilters          = TokenFilters(_sections);

        const   __dataMapper            = DataMapper(_sections);
        
        const   __codeMapper            = CodeMapper(
            _sections,
            __tokenFilters
        );


///////////////////////////////////////////////////////////
//  __dash()                                             //
///////////////////////////////////////////////////////////
//
//  This is used to pad output with a repeated character,
//  used to indent the output - beautification, nothing
//  more.
//
        global.__dash                  = (

            char                        = '-'

        ) =>
        {

            return new Array(__include_depth + 1).join(char);

        };


///////////////////////////////////////////////////////////
//  __process_header()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_header        = tokens =>
        {

            if (tokens[2] === global.S16_HEADER_MODEL)
            {
                if (tokens.length != 4)
                    global.__s16_file_error(tokens, `The <!<bold>!>${global.S16_HEADER_MODEL}<!<reset>!> option expects exactly one parameter`);
            
                if (global.S16_MODELS.indexOf(tokens[3]) < 0)
                    global.__s16_file_error(tokens, `'<!<bold>!>${tokens[3]}<!<bold>!>' is not a valid parameter for the <!<bold>!>${global.S16_HEADER_MODEL}<!<bold>!> option`);

                const   _objLabel       = _sections.find(global.S16_HEADER_MODEL);
                const   __model         = global.S16_MODELS.indexOf(tokens[3]);

                global.__s16_verbose(`<!<fg blue>!>+----<!<reset>!> Line ${global.__s16a_number(tokens[1])} `);
                global.__s16_verbose(`Setting ${global.__s16a_section(global.S16_SECTION_HEADER)} option <!<bold>!>${tokens[2]}<!<bold>!>=${global.__s16a_keyword(tokens[3])}\n`);

                _sections.sections[_objLabel.section].section.data[_objLabel.index][0] = __model;
            }

            if (tokens[2] === global.S16_HEADER_BYTEORDER)
            {
                if (tokens.length != 4)
                    global.__s16_file_error(tokens, `The <!<bold>!>${global.S16_HEADER_BYTEORDER}<!<reset>!> option expects exactly one parameter`);
            
                if (tokens[3] !== 'bigendian' && tokens[3] !== 'littleendian')
                    global.__s16_file_error(tokens, `'<!<bold>!>${tokens[3]}<!<bold>!>' is not a valid parameter for the <!<bold>!>${global.S16_HEADER_BYTEORDER}<!<bold>!> option`);

                const   _objLabel       = _sections.find(global.S16_HEADER_BYTEORDER);

                global.__s16_verbose(`<!<fg blue>!>+----<!<reset>!> Line ${global.__s16a_number(tokens[1])} `);
                global.__s16_verbose(`Setting ${global.__s16a_section(global.S16_SECTION_HEADER)} option <!<bold>!>${tokens[2]}<!<bold>!>=${global.__s16a_keyword(tokens[3])}\n`);

                if (tokens[3] === 'bigendian')
                    _sections.sections[_objLabel.section].section.data[_objLabel.index] = global.S16_BYTEORDER_BE;
                else
                    _sections.sections[_objLabel.section].section.data[_objLabel.index] = global.S16_BYTEORDER_LE;

            }

        };


///////////////////////////////////////////////////////////
//  __preprocess()                                       //
///////////////////////////////////////////////////////////
//
        const   __preprocess            = (

            objFileInfo, 
            lines

        ) =>
        {

    //  All source files open in the header section by default.
    //
            let     __current_section   = 'header';

            let     __line_count        = 0;

    //  Handling relative paths for the .include directive is
    //  a lot simpler if we cd to the directory of the source
    //  file during processing.
    //
            const   __parent_directory  = process.cwd();
            
            process.chdir(objFileInfo.dir);

            global.__s16_verbose(`<!<fg blue>!>+-${global.__dash()}<!<reset>!> Writing to ${global.__s16a_section(__current_section)} section:\n`);

    //  Cycle through every line of input.
    //
            for (let line_no = 0; line_no < lines.length; line_no++)
            {

                const   _tokens         = lines[line_no];

    //  Tokens 0 and 1 and the file path and line number, if
    //  we have < 3 tokens it's an empty line.
    //
                if (_tokens.length < 3)
                    continue;

                __line_count++;

    //  Filter the tokens, this will do a number of
    //  things - see:
    //
    //      System16/s16a/core/TokenFilters.js
    //
                __tokenFilters.filter_all(_tokens);

    //  Look for .directives - all directives are
    //  defined in:
    //
    //      System16/core/defs/Directives.js
    //
                if (_tokens[2].substring(1) === global.S16_DIRECTIVE_SECTION)
                {
                    _tokens[2] = _tokens[2].substring(1);

    //  The .section directive is used to switch between
    //  sections in a source file.
    //
    //  See:
    //
    //      System16/core/defs/Sections.js
    //
    //
    //  For more info.
    //
                    if (_tokens.length !== 4)
                        global.__s16_file_error(_tokens, `The .${global.__s16a_directive(global.S16_DIRECTIVE_SECTION)} directive expects exactly one parameter`);
                
                    if (global.S16_SECTIONS.indexOf(_tokens[3]) < 0)
                        global.__s16_file_error(_tokens, `'<!<bold>!>${_tokens[3]}<!<bold>!>' is not a valid parameter for the .${global.__s16a_directive(global.S16_DIRECTIVE_SECTION)} directive`);
                    
                    __current_section = _tokens[3];
                    global.__s16_verbose(`<!<fg blue>!>+-${global.__dash()}<!<reset>!> Switched to <!<fg yellow>!>${global.__s16a_section(__current_section)}<!<reset>!> section:\n`);

                    continue;
                }

    //  The .include directive allows us to include external
    //  source files.
    //
                if (_tokens[2].substring(1) === global.S16_DIRECTIVE_INCLUDE)
                {
                    if (_tokens.length < 4)
                        global.__s16_file_error(_tokens, `The .${global.__s16_directive(global.S16_DIRECTIVE_INCLUDE)} directive expects at least one parameter`);

                    let     __include_path = '';

    //  The TokenFilters module will deconstruct strings
    //  down to an array of ASCII codes - this means the
    //  file path needs to be reconstructed.
    //
                    for (let byte_no = 3; byte_no < _tokens.length; byte_no++)
                    {
                        let __byte  = String.fromCodePoint(_tokens[byte_no]);
                        
                        if (_tokens[byte_no] === 0 || __byte === ' ' || __byte === '\t')
                        {
                            __load_asm_file(__include_path);
                            __include_path = '';

                            continue;
                        }

                        __include_path += __byte;
                    }

                    if (__include_path.trim() !== '')
                        __load_asm_file(__include_path);

                    continue;
                }

    //  If it's not a directive then the line belongs to
    //  the current section.
    //
    //  Lines from the header are processed here in the
    //  Assembler.
    //
    //  Code and data (ro, rw and env) are processed
    //  by the CodeMapper and DataMapper modules.
    //
                if (__current_section === global.S16_SECTION_HEADER)
                    __process_header(_tokens);
                else if (__current_section === global.S16_SECTION_CODE)
                    line_no = __codeMapper.process_tokens(
                        lines,
                        line_no
                    );
                else
                    __dataMapper.process_tokens(__current_section, _tokens);

            }

            global.__s16_verbose(`<!<fg blue>!>+${global.__dash()}<!<reset>!> Done (${global.__s16a_number(__line_count)} total lines)\n`, true);

            __total_lines += __line_count;

            process.chdir(__parent_directory);

            return true;

        };


///////////////////////////////////////////////////////////
//  __load_asm_file()                                    //
///////////////////////////////////////////////////////////
//
        const   __load_asm_file         = file_name =>
        {
            
                // if (
                //     (file_name.substring(0, 1) === '\'')    ||
                //     (file_name.substring(0, 1) === "\"")    ||
                //     (file_name.substring(0, 1) === '`')
                // )
                //     file_name = file_name.substring(1, (file_name.length - 1));

    //  Attempt to load the input file.
    //
                const   _objFileInfo    = LoadFile(file_name);
                
                if (typeof _objFileInfo === 'string')
                    global.__s16_error(_objFileInfo);

                __include_depth++;
                if (objConfigure.depth > 0)
                {
                    if (__include_depth > objConfigure.depth)
                        global.__s16_error(`Include depth ${global.__s16a_number(objConfigure.depth)} reached`);
                }

                if (objConfigure.max > 0)
                {
                    if (_asm_paths.length >= objConfigure.max)
                        global.__s16_error(`Include max ${global.__s16a_number(objConfigure.max)} reached`);
                }

    //  Ensure the file hasn't already been loaded.
    //
                if (_asm_paths.indexOf(_objFileInfo.path) >= 0)
                    global.__s16_error(`File ${global.__s16a_file(_objFileInfo.path)} included more than once`);

                _asm_paths.push(_objFileInfo.path);

                global.__s16_verbose(`<!<fg blue>!>+${global.__dash()}<!<reset>!> Assembling source file ${global.__s16a_file(_objFileInfo.path)} (${global.__s16a_number(_objFileInfo.data.length)} bytes)\n`);

                __total_bytes += _objFileInfo.data.length;

    //  Tokenise the file data for the preprocessor.
    //
                const   _lines          = __tokeniser.get_tokens(
                    _objFileInfo.data,
                    _objFileInfo.path,
                    true
                );

                if (typeof _lines === 'string')
                    global.__s16_error(_lines);
                
    //  Pass the file data to the preprocessor.
    //
            __preprocess(
                _objFileInfo,
                _lines
            );

            __include_depth--;

        };


///////////////////////////////////////////////////////////
//  __initialise_header()                                //
///////////////////////////////////////////////////////////
//
        const   __initialise_header     = () =>
        {

            let __model                 = objConfigure[global.S16_HEADER_MODEL];
            let __maxaddr               = 0xFFFF;
            let __regsize               = 4;
            let __endianess             = global.S16_BYTEORDER_BE;

            __maxaddr = objConfigure[global.S16_HEADER_MAXADDR];
            __regsize = objConfigure[global.S16_HEADER_REGSIZE];

            if (objConfigure[global.S16_HEADER_BYTEORDER] === 'little-endian' || objConfigure[global.S16_HEADER_BYTEORDER] === 'le')
                __endianess         = global.S16_BYTEORDER_LE;
            else if (objConfigure[global.S16_HEADER_BYTEORDER] === 'big-endian' || objConfigure[global.S16_HEADER_BYTEORDER] === 'be')
                __endianess         = global.S16_BYTEORDER_BE;
            else
                global.__s16_error(`'<!<bold>!>${objConfigure[global.S16_HEADER_BYTEORDER]}<!<reset>!> is not a valid parameter for the <!<bold>!>--byteorder<!<bold>!> option`);

            _sections.sections[0].set(
                'default',  //  No file name/path
                'default',  //  No line number
                global.S16_HEADER_MODEL ,   //  Label
                1,          //  Type m8 (1-byte)
                1,          //  Size (1 element)
                [__model]   //  Value
            );

            _sections.sections[0].set(
                'default',  //  No file name/path
                'default',  //  No line number
                global.S16_HEADER_MAXADDR,  //  Label
                4,          //  Type m32 (4-bytes)
                1,          //  Size (1 element)
                [__maxaddr] //  Value
            );

            _sections.sections[0].set(
                'default',  //  No file name/path
                'default',  //  No line number
                global.S16_HEADER_REGSIZE,  //  Label
                4,          //  Type m32 (4-bytes)
                1,          //  Size (1 element)
                [__regsize] //  Value
            );

            _sections.sections[0].set(
                'default',  //  No file name/path
                'default',  //  No line number
                global.S16_HEADER_BYTEORDER,    //  Label
                1,          //  Type m8 (1-byte)
                2,          //  Size (2 elements)
    //  Can be 0xFF, 0x00 (big-endian) or 0x00, 0xFF
    //  (little-endian).
    //
                __endianess
            );

        };


///////////////////////////////////////////////////////////
//  _assemble()                                          //
///////////////////////////////////////////////////////////
//
        const   _assemble               = asm_files =>
        {

            __initialise_header();

            global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Assembling ${global.__s16a_number(asm_files.length)} source files...\n<!<fg blue>!>|<!<reset>!>\n`);

            for (let file_no = 0; file_no < asm_files.length; file_no++)
            {

                const   __file_name     = asm_files[file_no];

                __load_asm_file(__file_name);

            }

            global.__s16_verbose(`<!<fg blue>!>|\n+-<!<reset>!> Done, processed a total of ${global.__s16a_number(_asm_paths.length)} files (${global.__s16a_number(__total_lines)} lines, ${global.__s16a_number(__total_bytes)} bytes):\n<!<fg blue>!>|<!<reset>!>\n`)

            return true;

        };


        return {

            assemble:                   _assemble,
            asm_paths:                  _asm_paths,

            sections:                   _sections.sections,
            objSections:                _sections

        };

    };

