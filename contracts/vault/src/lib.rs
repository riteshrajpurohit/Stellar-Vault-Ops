#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, IntoVal,
    Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum VaultError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    Unauthorized = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultTotals {
    pub total_deposited: i128,
    pub total_distributed: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
enum DataKey {
    Admin,
    TokenContract,
    TotalDeposited,
    TotalDistributed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DepositEvent {
    pub from: Address,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DistributeEvent {
    pub to: Address,
    pub amount: i128,
}

fn read_admin(e: &Env) -> Result<Address, VaultError> {
    e.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(VaultError::NotInitialized)
}

fn read_token_contract(e: &Env) -> Result<Address, VaultError> {
    e.storage()
        .instance()
        .get(&DataKey::TokenContract)
        .ok_or(VaultError::NotInitialized)
}

fn total_deposited(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalDeposited)
        .unwrap_or(0)
}

fn total_distributed(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalDistributed)
        .unwrap_or(0)
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    pub fn initialize(e: Env, admin: Address, token_contract: Address) -> Result<(), VaultError> {
        if e.storage().instance().has(&DataKey::Admin) {
            return Err(VaultError::AlreadyInitialized);
        }

        admin.require_auth();

        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        e.storage().instance().set(&DataKey::TotalDeposited, &0_i128);
        e.storage().instance().set(&DataKey::TotalDistributed, &0_i128);

        Ok(())
    }

    pub fn deposit(e: Env, from: Address, amount: i128) -> Result<(), VaultError> {
        if amount <= 0 {
            return Err(VaultError::InvalidAmount);
        }

        read_admin(&e)?;

        from.require_auth();

        let token_contract = read_token_contract(&e)?;
        let vault_address = e.current_contract_address();

        // Real inter-contract call: moves tokens from user into this vault contract address.
        e.invoke_contract::<()>(
            &token_contract,
            &symbol_short!("transfer"),
            Vec::from_array(
                &e,
                [
                    from.clone().into_val(&e),
                    vault_address.into_val(&e),
                    amount.into_val(&e),
                ],
            ),
        );

        let next_total_deposited = total_deposited(&e) + amount;
        e.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &next_total_deposited);

        e.events().publish(
            (symbol_short!("deposit"), from.clone()),
            DepositEvent { from, amount },
        );

        Ok(())
    }

    pub fn distribute(e: Env, to: Address, amount: i128) -> Result<(), VaultError> {
        if amount <= 0 {
            return Err(VaultError::InvalidAmount);
        }

        // Keep initialization check, but allow any signer to trigger distribution.
        read_admin(&e)?;

        let token_contract = read_token_contract(&e)?;
        let vault_address = e.current_contract_address();

        // Real inter-contract call: sends tokens from this vault contract address to the recipient.
        e.invoke_contract::<()>(
            &token_contract,
            &symbol_short!("transfer"),
            Vec::from_array(
                &e,
                [
                    vault_address.into_val(&e),
                    to.clone().into_val(&e),
                    amount.into_val(&e),
                ],
            ),
        );

        let next_total_distributed = total_distributed(&e) + amount;
        e.storage()
            .instance()
            .set(&DataKey::TotalDistributed, &next_total_distributed);

        e.events().publish(
            (symbol_short!("distrib"), to.clone()),
            DistributeEvent { to, amount },
        );

        Ok(())
    }

    pub fn totals(e: Env) -> Result<VaultTotals, VaultError> {
        read_admin(&e)?;

        Ok(VaultTotals {
            total_deposited: total_deposited(&e),
            total_distributed: total_distributed(&e),
        })
    }

    pub fn vault_token_balance(e: Env) -> Result<i128, VaultError> {
        read_admin(&e)?;

        let token_contract = read_token_contract(&e)?;
        let vault_address = e.current_contract_address();

        Ok(e.invoke_contract::<i128>(
            &token_contract,
            &symbol_short!("balance"),
            Vec::from_array(&e, [vault_address.into_val(&e)]),
        ))
    }

    pub fn token_contract(e: Env) -> Result<Address, VaultError> {
        read_token_contract(&e)
    }

    pub fn admin(e: Env) -> Result<Address, VaultError> {
        read_admin(&e)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[contract]
    pub struct MockToken;

    #[contractimpl]
    impl MockToken {
        pub fn transfer(_e: Env, _from: Address, _to: Address, _amount: i128) {}
        pub fn balance(_e: Env, _owner: Address) -> i128 {
            0
        }
        pub fn mint(_e: Env, _to: Address, _amount: i128) {}
    }

    fn setup() -> (Env, Address, Address, Address) {
        let e = Env::default();
        let vault_id = e.register(VaultContract, ());
        let token_id = e.register(MockToken, ());
        let admin = Address::generate(&e);
        let user = Address::generate(&e);

        let vault = VaultContractClient::new(&e, &vault_id);

        e.mock_all_auths();
        vault
            .initialize(&admin, &token_id)
            .expect("initialize should succeed");

        (e, vault_id, admin, user)
    }

    #[test]
    fn deposit_updates_totals() {
        let (e, vault_id, _admin, user) = setup();
        let vault = VaultContractClient::new(&e, &vault_id);

        vault.deposit(&user, &100).expect("deposit should succeed");

        let totals = vault.totals().expect("totals should exist");
        assert_eq!(totals.total_deposited, 100);
        assert_eq!(totals.total_distributed, 0);
    }

    #[test]
    fn distribute_updates_totals() {
        let (e, vault_id, _admin, _user) = setup();
        let vault = VaultContractClient::new(&e, &vault_id);
        let recipient = Address::generate(&e);

        vault
            .distribute(&recipient, &30)
            .expect("distribution should succeed");

        let totals = vault.totals().expect("totals should exist");
        assert_eq!(totals.total_deposited, 0);
        assert_eq!(totals.total_distributed, 30);
    }
}