///////////////////////////////////////////////////////////
//  TermColour/TermColour.js                             //
///////////////////////////////////////////////////////////
//
//  Allows you to embed tags in text to change colours
//  and attributes on the console, e.g:
//
//      `Print someting in <!< bold >!>bold<!< bold >!>`
//      `Make it <!< fg red; bg white >!>red on white`
//


///////////////////////////////////////////////////////////
//  ANSI attribute codes.
//
    const   __TERMCOLOUR_ATTR_BOLD      = 1;
    const   __TERMCOLOUR_ATTR_DIM       = 2;
    const   __TERMCOLOUR_ATTR_ITALIC    = 3;
    const   __TERMCOLOUR_ATTR_UNDERLINE = 4;
    const   __TERMCOLOUR_ATTR_REVERSE   = 7;


///////////////////////////////////////////////////////////
//  ANSI colour codes.
//
    const   __TERMCOLOUR_COLOUR_BLACK   = 0;
    const   __TERMCOLOUR_COLOUR_RED     = 1;
    const   __TERMCOLOUR_COLOUR_GREEN   = 2;
    const   __TERMCOLOUR_COLOUR_YELLOW  = 3;
    const   __TERMCOLOUR_COLOUR_BLUE    = 4;
    const   __TERMCOLOUR_COLOUR_MAGENTA = 5;
    const   __TERMCOLOUR_COLOUR_CYAN    = 6;
    const   __TERMCOLOUR_COLOUR_WHITE   = 7;


    const   __TERMCOLOUR_COLOURS        =
    [
        "black",
        "red",
        "green",
        "yellow",
        "blue",
        "magenta",
        "cyan",
        "white"
    ];


///////////////////////////////////////////////////////////
//  Commands.
//
    const   __TERMCOLOUR_CMD_RESET      = 'reset';

    const   __TERMCOLOUR_CMD_BOLD       = 'bold';
    const   __TERMCOLOUR_CMD_DIM        = 'dim';
    const   __TERMCOLOUR_CMD_ITALIC     = 'italic';
    const   __TERMCOLOUR_CMD_UNDERLINE  = 'underline';
    const   __TERMCOLOUR_CMD_REVERSE    = 'reverse';

    const   __TERMCOLOUR_CMD_FG         = 'fg';
    const   __TERMCOLOUR_CMD_BG         = 'bg';


    const   __TERMCOLOUR_COMMANDS       =
    [
        __TERMCOLOUR_CMD_RESET,
        __TERMCOLOUR_CMD_BOLD,
        __TERMCOLOUR_CMD_DIM,
        __TERMCOLOUR_CMD_ITALIC,
        __TERMCOLOUR_CMD_UNDERLINE,
        __TERMCOLOUR_CMD_REVERSE,
        __TERMCOLOUR_CMD_FG,
        __TERMCOLOUR_CMD_BG,
    ];


///////////////////////////////////////////////////////////
//  The TermColour module.                               //
///////////////////////////////////////////////////////////
//
    export const    TermColour          = (

        objConfigure                    =
        {

            OUTPUT_STREAM:              process.stdout,

    //  Setting this to false will prevent commands
    //  being executed.
    //
            CMD_ENABLE:                 true,

    //  We can embed commands between the prefix and
    //  suffix.
    //
            CMD_PREFIX:                 '<!<',
            CMD_SUFFIX:                 '>!>',

    //  Multiple commands can be separated by a
    //  delimiter.
    //
            CMD_DELIMITER:              ';'

        }

    ) =>
    {

        const   __output_stream         = objConfigure.OUTPUT_STREAM;

        let     __command_buffer        = '';


        let     __bold                  = false;
        let     __dim                   = false;
        let     __italic                = false;
        let     __underline             = false;
        let     __reverse               = false;

        let     __fg                    = __TERMCOLOUR_COLOUR_WHITE;
        let     __bg                    = __TERMCOLOUR_COLOUR_BLACK;


///////////////////////////////////////////////////////////
//  __get_command()                                      //
///////////////////////////////////////////////////////////
//
        const   __get_command           = (

            output_string,
            str_pos

        ) =>
        {
            
            __command_buffer            = '';

    //  Skip past the prefix string.
    //
            str_pos += objConfigure.CMD_PREFIX.length;

    //  Read everything up to the next command suffix.
    //
            while (str_pos < output_string.length)
            {

                const   __suffix        = output_string.substring(
                                            str_pos, 
                                            (str_pos + objConfigure.CMD_SUFFIX.length)
                                        );

    //  Adjust the str_pos - the main loop in the
    //  _print() method will increment it by 1 on
    //  return so need to account for that.
    //
                if (__suffix === objConfigure.CMD_SUFFIX)
                {
                    str_pos += (__suffix.length - 1);
                    break;
                }

    //  Bank the byte in the command buffer and
    //  repeat.
    //
                __command_buffer += output_string.substring(
                    str_pos,
                    ++str_pos
                )

            }

            return str_pos;

        };


///////////////////////////////////////////////////////////
//  __apply_attributes()                                 //
///////////////////////////////////////////////////////////
//
        const   __apply_attributes      = (

            reset_all                   = false

        ) =>
        {

    //  Reset everything.
    //
            __stream_write(`\x1b[0m`);

            if (reset_all)
                return;

    //  Build the ANSI output string.
    //
            let     __ansi_string       = `\x1b[3${__fg};4${__bg}`;

            if (__bold)
                __ansi_string += `;${__TERMCOLOUR_ATTR_BOLD}`;
            if (__dim)
                __ansi_string += `;${__TERMCOLOUR_ATTR_DIM}`;
            if (__italic)
                __ansi_string += `;${__TERMCOLOUR_ATTR_ITALIC}`;
            if (__underline)
                __ansi_string += `;${__TERMCOLOUR_ATTR_UNDERLINE}`;
            if (__reverse)
                __ansi_string += `;${__TERMCOLOUR_ATTR_REVERSE}`;

            __ansi_string += 'm';

    //  Apply.
    //
            __stream_write(__ansi_string);

        };


///////////////////////////////////////////////////////////
//  __reset_all()                                        //
///////////////////////////////////////////////////////////
//
        const   __reset_all             = () =>
        {

            __fg                        = __TERMCOLOUR_COLOUR_WHITE;
            __bg                        = __TERMCOLOUR_COLOUR_BLACK;
            __bold                      = false;
            __dim                       = false;
            __italic                    = false;
            __underline                 = false;
            __reverse                   = false;

            __apply_attributes(true);

            return true;
            
        };


///////////////////////////////////////////////////////////
//  __execute_command()                                  //
///////////////////////////////////////////////////////////
//
        const   __execute_command       = () =>
        {

            let     __response          = true;

            if (__command_buffer.trim() === '')
                return true;

            const   __commands          = __command_buffer.split(
                objConfigure.CMD_DELIMITER
            );

            __commands.forEach(command => {

                if (__response !== true)
                    return;

                const   __command       = command.trim().split(' ');

    //  Is the command valid?
    //
                const   __command_index = __TERMCOLOUR_COMMANDS.indexOf(__command[0]);

                if (typeof __command_index === 'string')
                    return __response = __command_index;

    //  Is it a reset?
    //
                if (__command[0] === __TERMCOLOUR_CMD_RESET)
                    return __reset_all();

    //  Attributes are just toggled on and off.
    //
                if (__command[0] === __TERMCOLOUR_CMD_BOLD)
                    __bold = (! __bold);
                else if (__command[0] === __TERMCOLOUR_CMD_DIM)
                    __dim = (! __dim);
                else if (__command[0] === __TERMCOLOUR_CMD_ITALIC)
                    __italic = (! __italic);
                else if (__command[0] === __TERMCOLOUR_CMD_UNDERLINE)
                    __underline = (! __underline);
                else if (__command[0] === __TERMCOLOUR_CMD_REVERSE)
                    __reverse = (! __reverse);
                else {
    //  The fg and bg commands are the only commands that
    //  require a parameter.
    //
                    if (
                        (__command[0] !== __TERMCOLOUR_CMD_FG)  &&
                        (__command[0] !== __TERMCOLOUR_CMD_BG)
                    )
                        return __response = `Unknown command '${__command[0]}'`;

                    if (__command.length !== 2)
                        return __response = `The ${__command[0]} command expects exactly one parameter`;

                    let     __colour;

                    if (/^[0-7]$/.test(__command[1]))
    //  We can reference a colour by number, e.g:
    //
    //      fg 1
    //
    //  To set the foreground (text) colour to red.
    //
                        __colour = parseInt(__command[1]);
                    else
                    {
    //  Or we can specify a colour by name.
    //
                        __colour = __TERMCOLOUR_COLOURS.indexOf(__command[1]);

                        if (__colour < 0)
                            return __response = `Unknown colour '${__colour}`;
                    }

                    if (__command[0] === __TERMCOLOUR_CMD_FG)
                        __fg = __colour;
                    else
                        __bg = __colour;
                }

                __apply_attributes();

            });

            return __response;

        };


///////////////////////////////////////////////////////////
//  __stream_write()                                     //
///////////////////////////////////////////////////////////
//
        const   __stream_write          = (
            
            output_string,
            str_pos                     = false
        
        ) =>
        {

            let     __output_string     = output_string;

            if (str_pos !== false)
                __output_string         = output_string.substring(
                    str_pos,
                    (str_pos + 1)
                );
            
            if (__output_stream === process.stdout || __output_stream === process.stderr)
                __output_stream.write(__output_string);
            else
                __output_stream(__output_string);

        }


///////////////////////////////////////////////////////////
//  _print()                                             //
///////////////////////////////////////////////////////////
//
        const   _print                  = (
            
            output_string,
            reset_term                  = false

        ) =>
        {

            for (let str_pos = 0; str_pos < output_string.length; str_pos++)
            {

    //  Look for a command prefix...
    //
                const   __prefix        = output_string.substring(
                                            str_pos,
                                            (str_pos + objConfigure.CMD_PREFIX.length)
                                        );

                if (__prefix === objConfigure.CMD_PREFIX)
                {
                    str_pos  = __get_command(
                        output_string,
                        str_pos
                    );
                    
    //  If __get_command() returns a string, it's an error
    //  message and is returned.
    //
                    if (typeof str_pos === 'string')
                        return str_pos;

                    if (str_pos === true)
                        continue;

    //  The command string is stored in __command_buffer,
    //  all we have to do is call the __execute_command()
    //  method.
    //
                    if (objConfigure.CMD_ENABLE)
                    {
                        const   __response = __execute_command();

    //  The __execute_command() method returns a an
    //  error message on error, or true otherwise.
    //
                        if (typeof __response === 'string')
                            return __response;
                    }

                    continue;
                }

    //  Print the next byte.
    //
                __stream_write(
                    output_string,
                    str_pos
                );

            }

    //  if reset_term is true, everything is reset on return.
    //
            if (reset_term === true)
                __reset_all();

            return true;

        };


        return {

            print:                      _print

        };

    };

