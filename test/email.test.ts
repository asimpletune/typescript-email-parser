import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'fs'
import { Email } from '../src/email';

let email = Email.parse(readFileSync('./test/resources/hello_world.eml', 'ascii'))!
let reply = Email.parse(readFileSync('./test/resources/hello_world_reply.eml', 'ascii'))!

describe('fields', () => {
  test('orig_date', () => {
    expect(email.orig_date).toEqual({ "day": "20", "dayOfWeek": "Tue", "hour": "20", "minute": "28", "month": "Jun", "second": "11", "year": "2023", "zone": "+0200" })
  })
  test('from', () => {
    expect(email.from).toEqual([{ "email": "test@example.com", "name": undefined }])
  })
  test('sender', () => {
    expect(email.sender).toEqual({ "email": "savannah@example.com", "name": "Savannah Secretary" })
  })
  test('reply_to', () => {
    expect(email.reply_to).toEqual([{ "email": "olivia@example.com", "name": "olivia" }])
  })
  test('to', () => {
    expect(email.to?.[0]).toEqual({ "email": "bob@example.com", "name": undefined })
    expect(email.to?.slice(1)).toEqual([{ "email": "alice@example.com", "name": "Alice" }])
  })
  test('cc', () => {
    expect(email.cc).toEqual([{ "email": "carol@example.com", "name": "carol" }])
  })
  test('bcc', () => {
    expect(email.bcc).toEqual([{ "email": "eve@example.com", "name": "Eve" }])
  })
  test('message_id', () => {
    expect(email.message_id).toEqual("FE97A840-9401-4B26-902E-61EB5D6CD285@example.com")
  })
  test('in_reply_to', () => {
    expect(email.in_reply_to).toBeUndefined
    expect(reply.in_reply_to).toEqual(["FE97A840-9401-4B26-902E-61EB5D6CD285@example.com"])
  })
  test('references', () => {
    expect(email.references).toBeUndefined
    expect(reply.references).toEqual(["FE97A840-9401-4B26-902E-61EB5D6CD285@example.com"])
  })
  test('subject', () => { expect(email.subject).toBe("This is a test email") })
  test('comments', () => {
    expect(email.comments)
      .toEqual(["This feature is not used a whole lot", "But it's still good to test it"])
  })
  test('keywords', () => { expect(email.keywords).toEqual([["tests", "emails"], ["open source", "example"]]) })
  test('optional_fields', () => {
    expect(email.optional_fields).toEqual([{
      name: "Content-Type", body: `multipart/alternative;\r\n\tboundary="Apple-Mail=_34F098F6-D5B7-4B8B-8443-7EC0348A5A0E"`
    },
    { name: "Mime-Version", body: "1.0 (Mac OS X Mail 16.0 \\(3731.500.231\\))" },
    { name: "X-Universally-Unique-Identifier", body: "933A3A26-A86B-4D3C-B393-2C260D5BC557" },
    {
      name: "DKIM-Signature", body: 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=icloud.com;\r\n' +
        '\ts=1a1hai; t=1687344318;\r\n' +
        '\tbh=5wGqZpy6dZ0+lmq9+LJ9zZRkTbQ9XKci2Y5LbCPvIhQ=;\r\n' +
        '\th=Date:from:to:Subject:MIME-Version:Content-Type:Message-Id;\r\n' +
        '\tb=zBp8hCrzROGEH70XFjVzSyls/HERnOfjYcBlAD3w3/bzJ5m+ZksUuu/zEq4C1Shxq\r\n' +
        '\t nCC1ccruN/t6Kb5vPK+Wc+mnlPtBN2TFyI4ij1z7TMSDSwPWFTLb05AUtIp3q8c2z3\r\n' +
        '\t mRIR0OsuEZTT3eJrHzc54Vw0yH9sw2BxXxLMbc4fHihWRmfhIOvUBJ8svY9q7+v8+i\r\n' +
        '\t QZnX2meUC/Xs5rlfQxTy9X+lXlBfS7JLD3lSWF4fQz1kgrJ7SRgFb5FwFpkHg+SZfE\r\n' +
        '\t R1ecxrUpj8un+Z21qDGYn01N91qQbW/GjLpTHrsyG8uoDQPByg5nr3kfzqRnqOkYae\r\n' +
        '\t OhP85bABfn+7g=='
    }])
  })
})

describe('body', () => {
  expect(email.body).toBe('\r\n' +
    '\r\n' +
    '--Apple-Mail=_34F098F6-D5B7-4B8B-8443-7EC0348A5A0E\r\n' +
    'Content-Transfer-Encoding: 7bit\r\n' +
    'Content-Type: text/plain;\r\n' +
    '\tcharset=us-ascii\r\n' +
    '\r\n' +
    'Hello, world\r\n' +
    '\r\n' +
    '-Tester\r\n' +
    '\r\n' +
    '\r\n' +
    '--Apple-Mail=_34F098F6-D5B7-4B8B-8443-7EC0348A5A0E\r\n' +
    'Content-Transfer-Encoding: 7bit\r\n' +
    'Content-Type: text/html;\r\n' +
    '\tcharset=us-ascii\r\n' +
    '\r\n' +
    '<html><head><meta http-equiv="content-type" content="text/html; charset=us-ascii"></head><body style="overflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;"><div dir="auto" style="overflow-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">Hello, world<br><br><div>\r\n' +
    '<div>-Spence</div>\r\n' +
    '\r\n' +
    '</div>\r\n' +
    '\r\n' +
    '<br></div></body></html>\r\n' +
    '--Apple-Mail=_34F098F6-D5B7-4B8B-8443-7EC0348A5A0E--')
})