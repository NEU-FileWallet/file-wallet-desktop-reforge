import { Base64 } from "js-base64"
import { join } from "path"
import { boostrapCheck, generateShareLinkForDir } from "../src/scripts/utils"
import { AppConfig } from '../src/scripts/config'

it('test shareLinkGeneration', () => {
    const link = generateShareLinkForDir('123456')
    expect(JSON.parse(Base64.decode(link.replace('bdsl://', ''))).key).toEqual('123456')
})

it('testBootstrapCheck', async () => {
    const testConfig: Partial<AppConfig> = {
        walletDirectory: join(__dirname, 'test_data', 'wallet'),
        connectionProfilePath: join(__dirname, 'test_data', 'profile.json'),
        userID: 'gmyx',
        IPFSPath: 'ipfs'
    }

    const result = await boostrapCheck(testConfig as AppConfig)
    expect(!result.IPFS && result.identity && result.profile).toBeTruthy()
})

