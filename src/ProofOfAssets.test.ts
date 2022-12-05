import { ProofOfAsset } from './ProofOfAsset';
import {
  isReady,
  shutdown,
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  Field,
  Poseidon,
  Encoding,
} from 'snarkyjs';

describe('ProofOfAssets.js', () => {
  let zkApp: ProofOfAsset,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    deployer: PrivateKey;
  // alicePrivateKey: PrivateKey,
  // bobPrivateKey: PrivateKey,
  // janePrivateKey: PrivateKey,
  // tomPrivateKey: PrivateKey;

  async function initState(
    signerKey: PrivateKey,
    AssetVerifierUrlHash: Field,
    MinBalance: Field
  ) {
    console.log('initState called', MinBalance.toString());
    let tx = await Mina.transaction(signerKey, () => {
      zkApp.initState(AssetVerifierUrlHash, MinBalance);
    });
    await tx.prove();
    tx.sign([signerKey]);
    await tx.send();
  }
  beforeEach(async () => {
    await isReady;
    let Local = Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    deployer = Local.testAccounts[0].privateKey;
    // alicePrivateKey = Local.testAccounts[1].privateKey;
    // bobPrivateKey = Local.testAccounts[2].privateKey;
    // janePrivateKey = Local.testAccounts[3].privateKey;
    // tomPrivateKey = Local.testAccounts[4].privateKey;
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new ProofOfAsset(zkAppAddress);
    await deploy(zkApp, zkAppPrivateKey, deployer);
  });

  afterAll(() => {
    setTimeout(shutdown, 0);
  });
  describe('ProofOfAssets()', () => {
    it('should deploy', async () => {
      const AssetVerifierUrlHash_ = zkApp.AssetVerifierUrlHash.get();
      expect(AssetVerifierUrlHash_).toStrictEqual(Field(0));

      const MinBalance_ = zkApp.MinBalance.get();
      expect(MinBalance_).toStrictEqual(Field(0));
      const assetVerifierUrl = Encoding.stringToFields('www.dbs.com.sg');
      await initState(deployer, Poseidon.hash(assetVerifierUrl), Field(500));
      const AssetVerifierUrlHash__ = zkApp.AssetVerifierUrlHash.get();
      expect(AssetVerifierUrlHash__).toStrictEqual(
        Poseidon.hash(assetVerifierUrl)
      );
      const MinBalance__ = zkApp.MinBalance.get();
      expect(MinBalance__).toStrictEqual(Field(500));
    });
    it('should verify assets', async () => {
      const assetVerifierUrl = Encoding.stringToFields('www.dbs.com.sg');
      await initState(deployer, Poseidon.hash(assetVerifierUrl), Field(500));

      // let tx = await Mina.transaction(deployer, () => {
      //     zkApp.verifyAsset(

      //     DO SOMETHING HERE with VerifierData
      //     );
      //   });
      // await tx.prove();
      // await tx.sign([zkAppPrivateKey]).send();
    });
  });
});

async function deploy(
  zkApp: ProofOfAsset,
  zkAppPrivateKey: PrivateKey,
  account: PrivateKey
) {
  let tx = await Mina.transaction(account, () => {
    AccountUpdate.fundNewAccount(account);
    zkApp.deploy();
  });
  await tx.prove();
  // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
  await tx.sign([zkAppPrivateKey]).send();
}
