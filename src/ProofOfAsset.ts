import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Struct,
  Circuit,
} from 'snarkyjs';
class Transaction extends Struct({
  date: Field,
  credit: Field,
  debit: Field,
}) {}
class VerifierData extends Struct({
  tls: Field,
  relevantTransactions: [Transaction], // this is super lame, we cant have dynamically sized arrays just live with single first and make VerifierData2 VerifierData3 etc..?
}) {}

class ProofOfAsset extends SmartContract {
  @state(Field) AssetVerifierUrlHash = State<Field>();
  @state(Field) MinBalance = State<Field>();

  @method initState(_AssetVerifierUrlHash: Field, _MinBalance: Field) {
    // need to ensure this can only be called once
    const _AssetVerifierUrlHash_ = this.AssetVerifierUrlHash.get();
    this.AssetVerifierUrlHash.assertEquals(_AssetVerifierUrlHash_);
    // Circuit.log("ProofOfAsset:initState:assetVerifierUrl_",assetVerifierUrl_)
    // Circuit.log("ProofOfAsset:initState:_assetVerifierUrl",_assetVerifierUrl)
    this.AssetVerifierUrlHash.set(_AssetVerifierUrlHash);
    this.MinBalance.set(_MinBalance);
  }
  @method verifyAsset(verifierData: VerifierData) {
    // maybe we need to go for an access token/tmp url sort of way? so that fetch happens inside here
    // like fetch(www.dbs.com.sg/?token=)
    const assetVerifierUrl_ = this.AssetVerifierUrlHash.get();
    this.AssetVerifierUrlHash.assertEquals(assetVerifierUrl_);
    Circuit.log(
      'ProofOfAsset:verifyAsset:assetVerifierUrl_',
      assetVerifierUrl_
    );

    // assetVerifierUrl_.assertEquals(verifierData.tls); need to do something like this

    const MinBalance_ = this.MinBalance.get();
    Circuit.log('ProofOfAsset:verifyAsset:MinBalance_', MinBalance_);
    this.MinBalance.assertEquals(MinBalance_);
    const magicBalance = verifierData.relevantTransactions[0].credit; // this obj doesnt work
    MinBalance_.assertLte(magicBalance);
  } // this to get this execution success proof
}

export { Transaction, VerifierData, ProofOfAsset };
