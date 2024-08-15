///////////////////////////////////////////////////////////
//  System16/s16a/config/Colours.js                      //
///////////////////////////////////////////////////////////
//
//
//


    global.__s16a_title         = title =>          `<!<fg cyan; bold>!>${title}<!<reset>!>`;
    global.__s16a_file          = file_name =>      `<!<fg green; underline>!>${file_name}<!<reset>!>`;
    global.__s16a_memtype       = memtype =>        `<!<fg magenta; bold>!>${memtype}<!<reset>!>`;
    global.__s16a_keyword       = keyword =>        `<!<fg green; bold>!>${keyword}<!<reset>!>`;
    global.__s16a_number        = number =>         `<!<fg red; bold>!>${number}<!<reset>!>`;
    global.__s16a_directive     = directive =>      `<!<fg blue; bold>!>${directive}<!<reset>!>`;
    global.__s16a_section       = section =>        `<!<fg yellow; bold>!>${section}<!<reset>!>`;
    global.__s16a_label         = label =>          `<!<fg white; bold>!>${label}<!<reset>!>`;
    global.__s16a_size          = size =>           `<!<fg blue; bold>!>[<!<fg red>!>${size}<!<fg blue>!>]<!<reset>!>`;
    global.__s16a_operator      = operator =>       `<!<fg cyan>!>${operator}<!<reset>!>`;
    global.__s16a_mnemonic      = mnemonic =>       `<!<fg cyan>!>${mnemonic}<!<reset>!>`;
    global.__s16a_register      = register =>       `<!<fg blue; bold>!>${register}<!<reset>!>`;
    