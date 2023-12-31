# Typescript Email Parser

Parse emails into typed objects, that can be used in your typescript code ([Github](https://github.com/asimpletune/typescript-email-parser) | [npm](https://www.npmjs.com/package/typescript-email-parser?activeTab=readme))

 Parsing is done according to the [RFC5322](https://datatracker.ietf.org/doc/html/rfc5322#section-4.1) specification, see [grammar](#the-grammar).

**Table of Contents:**
<!-- TOC -->
- [Installation](#installation)
- [Features](#features)
- [How to use](#how-to-use)
- [FAQ](#faq)
- [Contributing](#contributing)
- [The Grammar](#the-grammar)
<!-- /TOC -->


## Installation

Install the project using `npm`

```zsh
npm install --save-dev typescript-email-parser
```

## Features

This project is a library for converting emails represented as strings into typed object that can be used by code. It supports Typescript.

It is a complete implementation of the [RFC5322](https://datatracker.ietf.org/doc/html/rfc5322#section-4.1) standard, for the specification of the structure of internet messages (i.e. emails).

## How to use

You can get an `email` object by supplying a string to the `parse` function as shown below. Note that invalid strings will return `undefined`. (*See the [grammar](#the-grammar) below for precise description on valid strings.*)

```typescript
import { Email } from 'typescript-email-parser';
import { readFileSync } from 'fs';

// Create an instance by parsing an email as a string
let email = Email.parse(readFileSync('./hello.eml', 'ascii'))!

// Access the various email fields directly
console.log(`Re: ${email.subject}`)
```

The following properties and their types are available

```typescript

export class Email {

  // Prepended Field Blocks
  prepended?        : PrependedFieldBlock[]

  // Normal email fields
  to?               : NonemptyList<Address>
  subject?          : string
  from?             : NonemptyList<Mailbox>
  cc?               : NonemptyList<Address>
  bcc?              : NonemptyList<Address>
  sender?           : Mailbox
  reply_to?         : NonemptyList<Address>
  orig_date?        : DateTime
  message_id?       : string
  in_reply_to?      : NonemptyList<string>
  references?       : NonemptyList<string>
  comments?         : string[]
  keywords?         : string[][]
  optional_fields?  : OptionalField[]

  /**
   *  Raw body.
   *  The `body` consists of strings that are
   *  a.) terminated by `\r\n` and
   *  b.) max 998 columns wide.
   */
  body?             : string

  /* ... */
}
```

Having every field be optional allows emails that are in various states of completion to be validly parsed, and conforms more closely to the rfc5322 spec's grammar.


## FAQ

Some commonly asked questions:

### Email not parsing

> I'm always getting `undefined` when I parse a valid email

The parser will parse most emails correctly, however there are two situations where an email can *seem* correct but is not.

1. Not using `CRLF` as line breaks.
2. The email MUST end in a `CRLF` line break.

A common way you can get this error is by copying a plain text email into an editor that is configured for that specific file to use `\n`, such as in your test code. What you can do is just replace `\n` with `\r\n` and it should work.

Also, as mentioned in point 2, that it's common for the the last `CRLF` to be left off when copying an email. If you add a `CRLF` line break at the end then you should be fine.

## Contributing

This is a new project and contributions are always welcome, just file an issue or open a PR. Things that are needed:

1. Help writing more tests
2. Parsing the body of the email into structured chunks, i.e. for multipart messages according to [RFC2045](https://datatracker.ietf.org/doc/html/rfc2045)
3. More granular functionality and convenience methods
4. Maybe a streaming version of this same project?
5. Refinement of the "rewriter" and that whole process

The project is maintained by [Spence](https://spenc.es/). Feel free to [open an issue](https://github.com/asimpletune/rfc5322-email-parser_ts/issues), or [contact](https://spenc.es/contact/) him directly.

## The Grammar

The following EBNF style grammar describes formally how emails are parsed.

```peg
// RFC 5322
// See: https://datatracker.ietf.org/doc/html/rfc5322
// The following is the RFC5322 "Internet Message Format" specification
// using tspeg to represent the grammar and to generate a parser in TS
// This file is intended purely to document (without computed fields)

// "Core Rules" from RFC5234
// See: https://datatracker.ietf.org/doc/html/rfc5234#appendix-B.1
CR              :=    '\x0D'              // carriage return, i.e. '\r'
CRLF            :=    '\r\n'              // Internet standard newline
DIGIT           :=    '\d'                // 0-9
TWO_DIGIT       :=    '\d\d'              // 00-99
FOUR_DIGIT      :=    '\d\d\d\d'          // 0000-9999
DQUOTE          :=    '\x22'              // double quote, i.e. '"'
HTAB            :=    '\x09'              // horizontal tab, i.e. 'TAB'
LF              :=    '\x0A'              // linefeed, i.e. '\n'
SP              :=    '\x20'              // space, i.e. 'Space'
VCHAR           :=    '[\x21-\x7E]'       // visible (printing) characters
WSP             :=    SP | HTAB           // white space

// § 3.2.1 Quoted Characters
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.1
quoted_pair     :=    '\\' { VCHAR | WSP }  | obs_qp

// §3.2.2 Folding White Space and Comments
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.2
FWS             :=    { WSP* CRLF }? WSP+ |  obs_FWS
ctext           :=    '[\x21-\x27]' | '[\x2a-\x5b]' | '[\x5d-\x7e]' | obs_ctext
ccontent        :=    ctext | quoted_pair | comment
comment         :=    '\(' { FWS? ccontent }* FWS? '\)'
CFWS            :=    { FWS? comment }+ FWS? | FWS

// § 3.2.3 Atom
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.3
// (Printable US-ASCII characters not including specials. Used for atoms.)
atext           :=    '[A-Za-z0-9!#$%&\x27\*\+\-\/=?^_`{|}~]'
atom            :=    CFWS? atext+ CFWS?
dot_atom_text   :=    atext+ { '\.' atext+ }*
dot_atom        :=    CFWS? dot_atom_text CFWS?

// (Special characters that do not appear in atext)
specials        :=     '\(' |'\)' | '[<>]' | '\[' | '\]' | '[:;@]' | '\\' | ',' | '\.' | DQUOTE

// § 3.2.4 Quoted Strings
// See https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.4
// (Printable US-ASCII characters not including '"' or the quote character)
qtext           :=    '\x21' | '[\x23-\x5b]' | '[\x5d-\x7e]' | obs_qtext
qcontent        :=    qtext | quoted_pair
quoted_string   :=    CFWS? DQUOTE { FWS? qcontent }* FWS? DQUOTE CFWS?

// § 3.2.5 Miscellaneous Tokens
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.2.5
word            :=    atom | quoted_string
phrase          :=    word+ | obs_phrase
unstructured    :=    { FWS? VCHAR }* WSP* | obs_unstruct

// § 3.3.  Date and Time Specification
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.3
date_time       :=    { day_of_week ',' }? date time CFWS?
day_of_week     :=    FWS? day_name | obs_day_of_week
day_name        :=    'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
date            :=    day month year
day             :=    FWS? DIGIT DIGIT? FWS | obs_day
month           :=    'Jan' | 'Feb' | 'Mar' | 'Apr' |
                      'May' | 'Jun' | 'Jul' | 'Aug' |
                      'Sep' | 'Oct' | 'Nov' | 'Dec'
year            :=    FWS FOUR_DIGIT DIGIT* FWS | obs_year
time            :=    time_of_day zone
time_of_day     :=    hour ':' minute { ':' second }?
hour            :=    TWO_DIGIT | obs_hour
minute          :=    TWO_DIGIT | obs_minute
second          :=    TWO_DIGIT | obs_second
zone            :=    FWS { '\+' | '\-' } FOUR_DIGIT | obs_zone

// § 3.4 Address Specification
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.4
address         :=    mailbox | group
mailbox         :=    name_addr | addr_spec
name_addr       :=    display_name? angle_addr
angle_addr      :=    CFWS? '<' addr_spec '>' CFWS? | obs_angle_addr
group           :=    display_name ':' group_list? ';' CFWS?
display_name    :=    phrase
mailbox_list    :=    mailbox { ',' mailbox }* | obs_mbox_list
address_list    :=    address { ',' address }* | obs_addr_list
group_list      :=    mailbox_list | CFWS | obs_group_list

// § 3.4.1 Addr-Spec Specification
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.4.1
addr_spec       :=    local_part '@' domain
local_part      :=    dot_atom | quoted_string | obs_local_part
domain          :=    dot_atom | domain_literal | obs_domain
domain_literal  :=    CFWS? '\[' { FWS? dtext }* FWS? '\]' CFWS?
// (Printable US-ASCII characters not including '[', ']', or '\"')
dtext           :=    '[\x21-\x5a]' | '[\x5e-\x7e]' | obs_dtext

// § 3.5 Overall Message Syntax
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.5
message         :=    { fields | obs_fields } { CRLF body }?
body            :=    { _998text CRLF }* _998text | obs_body
text            :=    '[\x01-\x09]' | '\x0B' | '\x0C' | '[\x0E-\x7f]' // Characters excluding CR and LF
_998text        :=    '[\x01-\x09\x0B\x0C\x0E-\x7F]{0,998}'            // Note: _998text to workaround tspeg operator

// § 3.6 Field Definitions
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6
fields          :=    {
                        trace optional_field* |
                        { resent_date | resent_from | resent_sender | resent_to | resent_cc | resent_bcc | resent_msg_id }*
                      }*
                      { orig_date | from | sender | reply_to | to | cc | bcc | message_id | in_reply_to | references | subject | comments | keywords | optional_field }*

// § 3.6.1. The Origination Date Field
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.1
orig_date       :=   'Date' ':' date_time CRLF

// § 3.6.2 Originator Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.2
from            :=    'From' ':' mailbox_list CRLF
sender          :=    'Sender' ':' mailbox CRLF
reply_to        :=    'Reply-To' ':' address_list CRLF

// § 3.6.3 Destination Address Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.3
to              :=    'To' ':' address_list CRLF
cc              :=    'Cc' ':' address_list CRLF
bcc             :=    'Bcc' ':' { address_list | CFWS }? CRLF

// § 3.6.4 Identification Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.4
message_id      :=    'Message-ID' ':' msg_id CRLF
in_reply_to     :=    'In-Reply-To' ':' msg_id+ CRLF
references      :=    'References' ':' msg_id+ CRLF
msg_id          :=    CFWS? '<' id_left '@' id_right '>' CFWS?
id_left         :=    dot_atom_text | obs_id_left
id_right        :=    dot_atom_text | no_fold_literal | obs_id_right
no_fold_literal :=    '\[' dtext* '\]'

// § 3.6.5 Informational Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.5
subject         :=    'Subject' ':' unstructured CRLF
comments        :=    'Comments' ':' unstructured CRLF
keywords        :=    'Keywords' ':' phrase { ',' phrase }* CRLF

// § 3.6.6 Resent Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.6
resent_date     :=    'Resent-Date' ':' date_time CRLF
resent_from     :=    'Resent-From' ':' mailbox_list CRLF
resent_sender   :=    'Resent-Sender' ':' mailbox CRLF
resent_to       :=    'Resent-To' ':' address_list CRLF
resent_cc       :=    'Resent-Cc' ':' address_list CRLF
resent_bcc      :=    'Resent-Bcc' ':' {address_list | CFWS }? CRLF
resent_msg_id   :=    'Resent-Message-ID' ':' msg_id CRLF

// § 3.6.7 Trace Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.7
trace           :=    return_path? received+
return_path     :=    'Return-Path' ':' path CRLF
path            :=    angle_addr | CFWS? '<' CFWS '>' CFWS?
received        :=    'Received' ':' received_token* ';' date_time CRLF
received_token  :=    word | angle_addr | addr_spec | domain

// § 3.6.8 Optional Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-3.6.8
optional_field  :=    field_name ':' unstructured CRLF
field_name      :=    ftext+
ftext           :=    '[\x21-\x39]' |   // ; Printable US-ASCII
                      '[\x3b-\x7e]'     // ;  characters not including  ":".

// § 4.1 Miscellaneous Obsolete Tokens
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.1
// (US-ASCII control characters that do not include the carriage return, line feed, and white space characters)
obs_NO_WS_CTL   :=    '[\x01-\x08]' | '\x0B' | '\x0C' | '[\x0E-\x1F]' | '\x7F'
obs_ctext       :=    obs_NO_WS_CTL
obs_qtext       :=    obs_NO_WS_CTL
obs_utext       :=    '\x00' | obs_NO_WS_CTL | VCHAR
obs_qp          :=    '\\' { '\x00' | obs_NO_WS_CTL | LF | CR }
obs_body        :=    { { LF* CR* { { '\x00' | text } LF* CR* }* } | CRLF }*
obs_unstruct    :=    { { LF* CR* { obs_utext LF* CR* }* } | FWS}*
obs_phrase      :=    word { word | '.' | CFWS }
obs_phrase_list :=    { phrase | CFWS } { ',' { phrase | CFWS }? }*

// § 4.2 Obsolete Folding White Space
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.2
obs_FWS         :=    WSP+ { CRLF WSP+ }*

// § 4.3. Obsolete Date and Time
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.3
obs_day_of_week :=    CFWS? day_name CFWS?
obs_day         :=    CFWS? DIGIT DIGIT? CFWS?
obs_year        :=    CFWS? TWO_DIGIT DIGIT* CFWS?
obs_hour        :=    CFWS? TWO_DIGIT CFWS?
obs_minute      :=    CFWS? TWO_DIGIT CFWS?
obs_second      :=    CFWS? TWO_DIGIT CFWS?
obs_zone        :=    'UT' | 'GMT' |  // ; Universal Time
                                      // ; North American UT
                                      // ; offsets
                      'EST' | 'EDT' | // ; Eastern:  - 5| - 4
                      'CST' | 'CDT' | // ; Central:  - 6| - 5
                      'MST' | 'MDT' | // ; Mountain: - 7| - 6
                      'PST' | 'PDT' | // ; Pacific:  - 8| - 7
                      '[\x41-\x49]' | // ; Military zones - "A"
                      '[\x4b-\x5a]' | // ; through "I" and "K"
                      '[\x61-\x69]' | // ; through "Z", both
                      '[\x6b-\x7a]'   // ; upper and lower case

// § 4.4 Obsolete Addressing
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.4
obs_angle_addr  :=    CFWS? '<' obs_route addr_spec '>' CFWS?
obs_route       :=    obs_domain_list ':'
obs_domain_list :=    { CFWS | ',' }* '@' domain { ',' CFWS? { '@' domain }? }*
obs_mbox_list   :=    { CFWS? ',' }* mailbox { ',' { mailbox | CFWS }? }*
obs_addr_list   :=    { CFWS? ',' }* address { ',' { address | CFWS }? }*
obs_group_list  :=    { CFWS? ',' }+ CFWS?
obs_local_part  :=    word { '\.' word }*
obs_domain      :=    atom { '\.' atom }*
obs_dtext       :=    obs_NO_WS_CTL | quoted_pair

// § 4.5 Obsolete Header Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5
obs_fields      :=    { obs_return | obs_received | obs_orig_date | obs_from | obs_sender |
                        obs_reply_to | obs_to | obs_cc | obs_bcc | obs_message_id | obs_in_reply_to |
                        obs_references | obs_subject | obs_comments | obs_keywords | obs_resent_date |
                        obs_resent_from | obs_resent_send | obs_resent_rply | obs_resent_to | obs_resent_cc |
                        obs_resent_bcc | obs_resent_mid | obs_optional }*

// § 4.5.1.  Obsolete Origination Date Field
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.1
obs_orig_date   :=    'Date' WSP* ':' date_time CRLF

// § 4.5.2.  Obsolete Originator Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.2
obs_from        :=    'From' WSP* ':' mailbox_list CRLF
obs_sender      :=    'Sender' WSP* ':' mailbox CRLF
obs_reply_to    :=    'Reply-To' WSP* ':' address_list CRLF

// § 4.5.3.  Obsolete Destination Address Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.3
obs_to          :=    'To' WSP* ':' address_list CRLF
obs_cc          :=    'Cc' WSP* ':' address_list CRLF
obs_bcc         :=    'Bcc' WSP* ':' { address_list | { CFWS? ',' }* CFWS? } CRLF

// § 4.5.4.  Obsolete Identification Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.4
obs_message_id  :=    'Message-ID' WSP* ':' msg_id CRLF
obs_in_reply_to :=    'In-Reply-To' WSP* ':' { phrase | msg_id }* CRLF
obs_references  :=    'References' WSP* ':' { phrase | msg_id }* CRLF
obs_id_left     :=    local_part
obs_id_right    :=    domain

// § 4.5.5.  Obsolete Informational Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.5
obs_subject     :=    'Subject'   WSP* ':' unstructured     CRLF
obs_comments    :=    'Comments'  WSP* ':' unstructured     CRLF
obs_keywords    :=    'Keywords'  WSP* ':' obs_phrase_list  CRLF

// § 4.5.6.  Obsolete Resent Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.6
// The obsolete syntax adds a 'Resent-Reply-To:' field, which consists of the field name, the optional comments and folding white space, the colon, and a comma separated list of addresses.
obs_resent_from :=    'Resent-From'       WSP* ':' mailbox_list CRLF
obs_resent_send :=    'Resent-Sender'     WSP* ':' mailbox      CRLF
obs_resent_date :=    'Resent-Date'       WSP* ':' date_time    CRLF
obs_resent_to   :=    'Resent-To'         WSP* ':' address_list CRLF
obs_resent_cc   :=    'Resent-Cc'         WSP* ':' address_list CRLF
obs_resent_bcc  :=    'Resent-Bcc'        WSP* ':' { address_list | { CFWS? ',' }* CFWS? } CRLF
obs_resent_mid  :=    'Resent-Message-ID' WSP* ':' msg_id CRLF
obs_resent_rply :=    'Resent-Reply-To'   WSP* ':' address_list CRLF

// As with other resent fields, the 'Resent-Reply-To:' field is to be treated as trace information only.

// § 4.5.7.  Obsolete Trace Fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.7
//The obs_return and obs_received are again given here as template definitions, just as return and received are in section 3.  Their full syntax is given in [RFC5321].
obs_return      :=    'Return-Path'       WSP* ':' path CRLF
obs_received    :=    'Received'          WSP* ':' received_token* CRLF

// § 4.5.8.  Obsolete optional fields
// See: https://datatracker.ietf.org/doc/html/rfc5322#section-4.5.8
obs_optional    :=    field_name WSP* ':' unstructured CRLF
```