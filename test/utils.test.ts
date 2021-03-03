import { Base64 } from "js-base64"
import { generateShareLinkForDir } from "../src/scripts/utils"

it('test shareLinkGeneration', () => {
    const link = generateShareLinkForDir('123456')
    expect(JSON.parse(Base64.decode(link.replace('bdsl://', ''))).key).toEqual('123456')
})