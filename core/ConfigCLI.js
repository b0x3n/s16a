///////////////////////////////////////////////////////////
//  ConfigCLI/ConfigCLI.js                               //
///////////////////////////////////////////////////////////
//
//  Processes and sorts command-line options into an
//  object.
//


///////////////////////////////////////////////////////////
//  The ConfigCLI module.                                //
///////////////////////////////////////////////////////////
//
    export const    ConfigCLI           = (


///////////////////////////////////////////////////////////
//  We have to pass in an object defining the switches
//  and options.
//
        objParameters                   = {

    
///////////////////////////////////////////////////////////
//  Collector
//
//  Any command-line argument that isn't a -switch or
//  --option will be collected here.
//
            'collector':                [],


///////////////////////////////////////////////////////////
//  Switches
//
//  Switches are boolean and prefixed by a single -
//  character.
//
//  The x switch defined below is initialised as false
//  (switched off) by default.
//
//  If -x is found in the command-line options this will
//  be toggled to true, if it's found again it will be
//  toggled to false.
//
//  You can define any number of switches and name them
//  anything, the x is just an example.
//
            'switches':                 {
                'x':                    true
            },


///////////////////////////////////////////////////////////
//  Options
//
//  These are prefixed with -- and require at least one
//  parameter. Example, imagine we wanted to be able
//  so specify a --max <value> at the command line -
//  we'd set an option named 'max' and assign it
//  a default numeric value:
//
//      'options':              {
//          'max':              0
//      };
//
//  The type of the default value tells ObjectCLI what
//  type of value to expect.
//
//  Example - we want to collect a list of input files
//  to process, we can set an option named files, this
//  means the user can now use the command-line option:
//
//      --files
//
//  If we specify 'files' to be an array, this means that
//  one or more files can be specified:
//
//      --files one two three
//
            'options':                  {
                'files':                [],
                'number':               0,
                'string':               "A string"
            }

        }

    ) =>
    {

        const   _objConfig              = {};


///////////////////////////////////////////////////////////
//  __initialise_object()                                //
///////////////////////////////////////////////////////////
//
        const   __initialise_object     = () =>
        {

            if (objParameters.hasOwnProperty('collector'))
                _objConfig.collector    = [];

            if (objParameters.hasOwnProperty('switches'))
                Object.keys(objParameters.switches).forEach(
                    key => { _objConfig[key] = objParameters['switches'][key]; }
                );

            if (objParameters.hasOwnProperty('options'))
                Object.keys(objParameters.options).forEach(
                    key => { _objConfig[key] = objParameters['options'][key]; }
                );

            return true;
            
        };


///////////////////////////////////////////////////////////
//  __process_switch()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_switch        = arg =>
        {

            const   __key               = arg.substring(1);

            if (! _objConfig.hasOwnProperty(__key))
                return `Unknown command-line switch '-${__key}'`;

            _objConfig[__key] = (! _objConfig[__key]);

            return true;

        };


///////////////////////////////////////////////////////////
//  __is_switch()                                        //
///////////////////////////////////////////////////////////
//
        const   __is_switch             = option =>
        {

            if (option.substring(0, 1) !== '-')
                return false;

            if (_objConfig.hasOwnProperty(option.substring(1)))
                return true;

            return false;
            
        };


///////////////////////////////////////////////////////////
//  __is_option()                                        //
///////////////////////////////////////////////////////////
//
        const   __is_option             = option =>
        {

            if (option.substring(0, 2) !== '--')
                return false;

            if (_objConfig.hasOwnProperty(option.substring(2)))
                return true;

            return false;

        };


///////////////////////////////////////////////////////////
//  __process_option()                                   //
///////////////////////////////////////////////////////////
//
        const   __process_option        = (
            
            arg_array,
            argc
        
        ) =>
        {

            const   __key               = arg_array[argc].substring(2);

            if (! _objConfig.hasOwnProperty(__key))
                return `Unknown command-line option '--${__key}'`;

    //  If we're expecting a string or number then we
    //  require exactly one parameter.
    //
            const   __type              = (typeof _objConfig[__key]);

            if (__type === 'number' || __type === 'string')
            {
                if ((argc + 1) >= arg_array.length)
                    return `The --${__key} option requires exactly one parameter`;

                const   __parameter     = arg_array[++argc];

                if (__type === 'number')
                {
                    if (! /^[0-9]+$/.test(__parameter))
                        return `The --${__key} option expects a number`;

                    _objConfig[__key] = parseInt(__parameter);
                }
                else
                    _objConfig[__key] = __parameter;
            }
            else
            {
    //  If it's neither a number nor a string we assume
    //  it to be an array.
    //
    //  This means we can pass multiple parameters, the
    //  loop breaks when the first -switch or --option
    //  is found.
    //
                if ((argc + 1) >= arg_array.length)
                    return `The ${arg_array[argc]} option expects at least one parameter`;

                for (++argc; argc < arg_array.length; argc++)
                {
                    const   __arg       = arg_array[argc];

                    if (__is_switch(__arg) || __is_option(__arg))
                    {
    //  Need to back argc up so that the option/switch
    //  can be found in the _build_object() main loop.
    //
                        argc--;
                        break;
                    }

                    _objConfig[__key].push(__arg);
                }
            }

            return argc;

        };



///////////////////////////////////////////////////////////
//  _build_object()                                      //
///////////////////////////////////////////////////////////
//
        const   _build_object           = arg_array =>
        {

            let _error_msg              = false;

            __initialise_object();

            for (let argc = 2; argc < arg_array.length; argc++)
            {

                const   _argv           = arg_array[argc];


    ///////////////////////////////////////////////////////
    //  Do we have a - prefix?
    //
                if (_argv.substring(0, 1) === '-')
                {
    //  Is it a -switch or --option?
    //
                    if (_argv.substring(0, 2) !== '--')
                    {
                        if (! objParameters['switches'].hasOwnProperty(arg_array[argc].substring(1)))
                            return `Unknown switch: <!<bold>!>${arg_array[argc]}<!<bold>!>`;

                        _error_msg = __process_switch(arg_array[argc]);
                    }    
                    else
                    {
                        if (! objParameters['options'].hasOwnProperty(arg_array[argc].substring(2)))
                            return `Unknown option: <!<bold>!>${arg_array[argc]}<!<bold>!>`;
                        
    //  --option - the __process_option will consume at
    //  at least one argument hence the return to argc.
    //
                        argc = __process_option(arg_array, argc);
                    }

                    if (typeof argc === 'string' || typeof _error_msg === 'string')
                    {
                        if (typeof argc === 'string')
                            return argc;

                        return _error_msg;
                    }

                    continue;
                }

    ///////////////////////////////////////////////////////
    //  Collect.
    //
    //  Neither option nor switch - unknown, it's
    //  added to the collector.
    //
                if (objParameters.hasOwnProperty('collector'))
                    _objConfig.collector.push(arg_array[argc]);
                else
                    return `<!<bold>!>'${arg_array[argc]}<!<bold>!>' is not a known option or switch`;

            }

            return _objConfig;

        };


        return {

            build_object:               _build_object,

            objConfig:                  _objConfig

        };

    };

