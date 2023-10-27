use std::sync::OnceLock;

use k256::SecretKey;
use revm_primitives::{keccak256, Bytes, B256, U256};

use crate::{
    signature::{Signature, SignatureError},
    transaction::{kind::TransactionKind, signed::LegacySignedTransaction},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LegacyTransactionRequest {
    pub nonce: u64,
    pub gas_price: U256,
    pub gas_limit: u64,
    pub kind: TransactionKind,
    pub value: U256,
    pub input: Bytes,
}

impl LegacyTransactionRequest {
    /// Computes the hash of the transaction.
    pub fn hash(&self) -> B256 {
        keccak256(&rlp::encode(self))
    }

    /// Signs the transaction with the provided secret key.
    pub fn sign(self, secret_key: &SecretKey) -> Result<LegacySignedTransaction, SignatureError> {
        let hash = self.hash();

        let signature = Signature::new(hash, secret_key)?;

        Ok(LegacySignedTransaction {
            nonce: self.nonce,
            gas_price: self.gas_price,
            gas_limit: self.gas_limit,
            kind: self.kind,
            value: self.value,
            input: self.input,
            signature,
            hash: OnceLock::new(),
        })
    }
}

impl From<&LegacySignedTransaction> for LegacyTransactionRequest {
    fn from(tx: &LegacySignedTransaction) -> Self {
        Self {
            nonce: tx.nonce,
            gas_price: tx.gas_price,
            gas_limit: tx.gas_limit,
            kind: tx.kind,
            value: tx.value,
            input: tx.input.clone(),
        }
    }
}

impl rlp::Encodable for LegacyTransactionRequest {
    fn rlp_append(&self, s: &mut rlp::RlpStream) {
        s.begin_list(6);
        s.append(&self.nonce);
        s.append(&self.gas_price);
        s.append(&self.gas_limit);
        s.append(&self.kind);
        s.append(&self.value);
        s.append(&self.input.as_ref());
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use revm_primitives::Address;

    use super::*;

    fn dummy_request() -> LegacyTransactionRequest {
        let to = Address::from_str("0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e").unwrap();
        let input = hex::decode("1234").unwrap();
        LegacyTransactionRequest {
            nonce: 1,
            gas_price: U256::from(2),
            gas_limit: 3,
            kind: TransactionKind::Call(to),
            value: U256::from(4),
            input: Bytes::from(input),
        }
    }

    #[test]
    fn test_legacy_transaction_request_encoding() {
        // Generated by Hardhat
        let expected =
            hex::decode("dc01020394c014ba5ec014ba5ec014ba5ec014ba5ec014ba5e04821234").unwrap();

        let request = dummy_request();

        let encoded = rlp::encode(&request);
        assert_eq!(expected, encoded.to_vec());
    }

    #[test]
    fn test_legacy_transaction_request_hash() {
        // Generated by hardhat
        let expected = B256::from_slice(
            &hex::decode("41a46eddeeb251dc89bfe9d59ad27413909630a4c973dbdbbf23ab4aeed02818")
                .unwrap(),
        );

        let request = dummy_request();
        assert_eq!(expected, request.hash());
    }
}
