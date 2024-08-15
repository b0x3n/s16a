///////////////////////////////////////////////////////////
//  System16/s16a/core/Sections.js                       //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  The Section module.                                  //
///////////////////////////////////////////////////////////
//
    const   Section                     = (

        read_only                       = false

    ) =>
    {

        const   _section                =
        {

            'path':                     [],
            'line':                     [],
            'label':                    [],
            'type':                     [],
            'size':                     [],
            'data':                     [],
            'length':                   [],
            'offset':                   [],
            'total_length':             0

        };


///////////////////////////////////////////////////////////
//  _validate_label()                                    //
///////////////////////////////////////////////////////////
//
        const   _validate_label         = (
            
            label,
            is_function                 = false
            
        ) =>
        {

            if (is_function === true && label === '_main')
                return true;

    //  May only begin with an alphabetic character or
    //  _ (underscore).
    //
    //  Subsequent characters may only be alpha-numeric
    //  or the _ character.
    //
    //      _one_1
    //      _1_one_
    //      one_1_
    //
    //  All valid, however:
    //
    //      1_one
    //
    //  Is not.
    //
            if (! /^[a-zA-Z_][a-zA-Z0-9_]+$/.test(label))
                return `Cannot declare label '${global.__s16a_label(label)}' - contains invalid characters`;

    //  The label can't match any keyword - see:
    //
    //      System16/core/defs/Keywords.js
    //
            if (global.S16_KEYWORDS.indexOf(label) >= 0)
                return `Cannot declare label '${global.__s16a_label(label)}', this is a reserved keyword`;
    
            return true;

        };


///////////////////////////////////////////////////////////
//  _get()                                               //
///////////////////////////////////////////////////////////
//
        const   _get                    = (

            label,
            index                       = false

        ) =>
        {

            let     _index              = _section.label.indexOf(label);
            let     _data               = false;

            if (_index < 0)
                return false;

    //  Label exists, if index is false we return the
    //  entire data array, if index is non-false it's
    //  assumed to be an index for the data array.
    //
            if (index !== false)
            {
                if (index < 0 || index >= _section.size[_index])
                    return `Index ${global.__s16a_number(index)} out of range for ${global.__s16a_label(label)}${global.__s16a_size(_section.size[_index])}`;
            
                _data = _section.data[_index][index];
            }
            else
                _data = _section.data[_index];

            return {
                'path':                 _section.path[_index],
                'line':                 _section.line[_index],
                'label':                _section.label[_index],
                'type':                 _section.type[_index],
                'size':                 _section.size[_index],
                'data':                 _data,
                'length':               _section.length[_index],
                'offset':               _section.offset[_index],
                'total_length':         _section.total_length,
                'index':                _index
            };

        };


///////////////////////////////////////////////////////////
//  _update()                                            //
///////////////////////////////////////////////////////////
//
        const   _update                 = (

            tokens,
            label,
            data,
            index                       = false

        ) =>
        {

            const   _index              = _section.label.indexOf(label);
            const   __element_index     = index;

            if (index === false)
                __element_index = _section.length[_index];

            if (_index < 0)
                return `Reference to undefined label '<!<bold>!>${global.__s16a_label(label)}'`;

            if (index === false)
            {
                if (data.length > _section.size[_index])
                    return `Attempt to store ${global.__s16a_number(data.length)} bytes in ${global.__s16a_label(label)}${global.__s16a_size(_section.size[_index])}`;

                for (let item_no = 0; item_no < _section.size[_index]; item_no++)
                {
                    if (item_no < data.length)
                        _section.data[_index][item_no] = data[item_no];
                    else
                        _section.data[_index][item_no] = 0;
                }
            }
            else
            {
                for (let item_no = 0; item_no < data.length; item_no++, index++)
                {
                    if (index < 0 || index >= _section.size[_index])
                        return `Attempt to write to element ${global.__s16a_size(index)} of ${global.__s16a_label(label)}${global.__s16a_size(_section.size[_index])}`;

                    _section.data[_index][index] = data[item_no];
                }
            }

            const   __mem_index         = global.S16_MEMSIZES.indexOf(parseInt(_section.type[_index]));
            const   __mem_type          = global.S16_MEMTYPES[__mem_index];

            global.__s16_verbose(`<!<fg blue>!>+--${global.__dash()}<!<reset>!> Line ${global.__s16a_number(tokens[1])}: Update to `);
            global.__s16_verbose(`${global.__s16a_memtype(__mem_type)} ${global.__s16a_label(_section.label[_index])}${global.__s16a_size(__element_index)} = ${_section.data[_index]} `);
            global.__s16_verbose(`(${global.__s16a_number(_section.length[_index])} bytes @ offset ${global.__s16a_number(_section.offset[_index])}))\n`);
            
            return true;

        };


///////////////////////////////////////////////////////////
//  _delete()                                            //
///////////////////////////////////////////////////////////
//
        const   _delete                 = label =>
        {

            const   _index              = _section.label.indexOf(label);

            if (_index < 0)
                return `Cannot delete label '${global.__s16a_label(label)}' - label doesn't exist`;

            _section.total_length -= _section.length[_index];

            _section.path.splice(_index, 1);
            _section.line.splice(_index, 1);
            _section.label.splice(_index, 1);
            _section.type.splice(_index, 1);
            _section.size.splice(_index, 1);
            _section.data.splice(_index, 1);
            _section.length.splice(_index, 1);
            _section.offset.splice(_index, 1);

            return true;

        };


///////////////////////////////////////////////////////////
//  _set()                                               //
///////////////////////////////////////////////////////////
//
        const   _set                    = (

            path,
            line,
            label,
            type,
            size,
            data,
            index                       = false

        ) =>
        {

    //  Is the label valid?
    //
            const   __validate          = _validate_label(label);

            if (typeof __validate === 'string')
                return __validate;

    //  The length is calculated by multiplying type (size
    //  of each element) and size (number of elements).
    //
            const   __length            = (type * size);

    //  The number of elements in the data array may not
    //  exceed size.
    //
            if (data.length > size)
                return `Attempt to store ${global.__s16a_number(data.length)} elements in ${global.__s16a_label(label)}${global.__s16a_size(size)}`;

    //  If there are less than __length elements in data
    //  it will be padded with 0's.
    //
            while (data.length < size)
                data.push(0);

    //  All good - the label can be created.
    //
            _section.path.push(path);
            _section.line.push(line);
            _section.label.push(label);
            _section.type.push(type);
            _section.size.push(size);
            _section.data.push(data);
            _section.length.push(__length);
            _section.offset.push(_section.total_length);
            _section.total_length += __length;

            return true;

        };


        return {

            validate_label:             _validate_label,

            get:                        _get,
            update:                     _update,
            delete:                     _delete,
            set:                        _set,

            section:                    _section

        };

    }


///////////////////////////////////////////////////////////
//  The Sections module.                                 //
///////////////////////////////////////////////////////////
//
    export const    Sections            = () =>
    {

        const   _sections               =
        [

            Section(),                  // Header section.
            Section(),                  // The env section.
            Section(true),              // The ro section.
            Section(),                  // The rw section.
            Section(true)               // The code section.

        ];


///////////////////////////////////////////////////////////
//  _get_size_property()                                 //
///////////////////////////////////////////////////////////
//
        const   _get_size_property      = (
            
            tokens,
            token_start                 = 4

        ) =>
        {

    //  Does tokens[token_start] even exist? If it doesn't
    //  there is no size property - return false.
    //
            if (token_start >= tokens.length)
                return false;

    //  It exists, but is it a [ token? If not there is no
    //  size property - return false.
    //
            if (tokens[token_start] !== '[')
                return false;

    //  There is an opening [ - so a closing ] is expected
    //  or there's a problem. We might have something like:
    //
    //      m8  buffer[];
    //
    //  In this case, again - there is no size property,
    //  return false, however the [ and ] tokens will be
    //  removed.
    //
            if ((token_start + 1) >= tokens.length)
                return `Unexpected '[' token`;
            if (tokens[(token_start + 1)] === ']')
            {
                tokens.splice(token_start, 2);
                return false;
            }

    //  If we don't have the [ and ] tokens together then
    //  a size property followed by a ] token is expected.
    //
    //  This means an additional 2 tokens are required abd
    //  tokens[(token_start + 2)] is expected to be the
    //  closing ] token.
    //
            if ((token_start + 2) >= tokens.length)
                return `Unexpected '[' token`;

            if (tokens[(token_start + 2)] !== ']')
                return `Unexpected '[' token`;

    //  Fine, all that's needed now is the size token,
    //  it should be a number...
    //
            if (! /^[0-9]+$/.test(tokens[(token_start + 1)]))
                return `Invalid size property ${global.__s16a_size(tokens[(token_start + 1)])}`;

    //  All good, the size will be stored and returned,
    //  the [ size ] tokens are all removed from the
    //  tokens array.
    //
            const   _size               = parseInt(tokens[(token_start + 1)]);

            tokens.splice(token_start, 3);

            return _size;

        };


///////////////////////////////////////////////////////////
//  _find()                                              //
///////////////////////////////////////////////////////////
//
        const   _find                   = label =>
        {

    //  Look in all sections for label...
    //
            for (let section_no = 0; section_no < _sections.length; section_no++)
            {
                const   _objLabel       = _sections[section_no].get(label);

                if (typeof _objLabel === 'string')
                    return _objLabel;

                if (typeof _objLabel === 'object')
                {
    //  Found it - add the section number to the
    //  object before returning.
    //
                    _objLabel.section   = section_no;
                    
                    return _objLabel;
                }
            }

    //  Label doesn't exist.
    //
            return false;

        };


///////////////////////////////////////////////////////////
//  _add_data()                                          //
///////////////////////////////////////////////////////////
//
        const   _add_data               = (
        
            section,
            tokens
        
        ) =>
        {

            let     _path               = tokens[0];
            let     _line               = tokens[1];
            let     _label              = tokens[3];
            let     _type               = tokens[2];
            let     _size;
            let     _data               = [];

            let     __description       = "Declaration";

    //  Does the label already exist?
    //
            const   _objLabel           = _find(_label);

            if (typeof _objLabel === 'string')
                global.__s16_file_error(tokens, _objLabel);
            
            if (typeof _objLabel === 'object')
                global.__s16_file_error(tokens, `Attempted redeclaration of '${global.__s16a_label(_label)}'`);

    //  The memsize (1, 2 or 4) should be in tokens[2],
    //  the label name in tokens[3].
    //
            if (global.S16_MEMSIZES.indexOf(parseInt(tokens[2])) < 0)
                global.__s16_file_error(tokens, `Unknown data type '<!<bold>!>${tokens[2]}<!<bold>!>'`);

            if (tokens.length < 4)
                global.__s16_file_error(tokens, `${__description} of type ${global.__s16a_memtype(global.S16_MEMTYPES[tokens[2]])} requires a label`)

    //  Do we have a [ size ] property?
    //
            _size                       = _get_size_property(tokens);

            if (typeof _size === 'string')
                global.__s16_file_error(tokens, _size);

    //  If no size is specified, _get_size_property() will
    //  return false = we default to 1.
    //
            if (_size === false)
                _size = 1;

    //  Is this an assignment? If it is, tokens[4] will
    //  exist and will be an = operand.
    //
            if (tokens.length > 4)
            {
                if (tokens[4] !== '=')
                    global.__s16_file_error(tokens, `Unexpected token '<!<bold>!>${tokens[4]}<!<bold>!>'`);
            
    //  It's an assignment, this means that > 5 tokens
    //  are expected...
    //
                if (tokens.length === 5)
                    global.__s16_file_error(tokens, `Unexpected ${global.__s16a_operator('=')}`);
            
                for (let token_no = 5; token_no < tokens.length; token_no++)
                    _data.push(tokens[token_no]);
            }

            const   __section           = global.S16_SECTIONS.indexOf(section);
            const   __offset            = _sections[__section].section.total_length;

            const   __section_response  = _sections[__section].set(
                _path,
                _line,
                _label,
                _type,
                _size,
                _data
            );

            const   __total_bytes       = (_sections[__section].section.total_length - __offset);

            if (typeof __section_response === 'string')
                global.__s16_file_error(tokens, __section_response);

            const   __memtype           = global.S16_MEMTYPES[global.S16_MEMSIZES.indexOf(parseInt(_type))];

            global.__s16_verbose(`<!<fg blue>!>+--${global.__dash()}<!<reset>!> Line ${global.__s16a_number(tokens[1])}: Declaration of`);
            global.__s16_verbose(` ${global.__s16a_memtype(__memtype)} ${global.__s16a_label(_label)}${global.__s16a_size(_size)} = ${_data}`);
            global.__s16_verbose(` (${global.__s16a_number(__total_bytes)} bytes @ offset ${global.__s16a_number(__offset)})\n`);
            
            return true;

        };

        return {

            get_size_property:          _get_size_property,

            find:                       _find,
            add_data:                   _add_data,

            sections:                   _sections

        };

    };

