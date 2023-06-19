import { parse } from './message.fields'
import { readFileSync, writeFileSync } from 'fs'

let input = readFileSync('./test/resources/bigEmail.eml', 'ascii')
let output = parse(input).ast!.literal

writeFileSync('./scratch/output.eml', output)
