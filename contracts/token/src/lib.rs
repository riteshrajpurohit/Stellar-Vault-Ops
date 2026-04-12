#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, Env, String};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum TokenError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    InsufficientBalance = 4,
    InvalidAmount = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub total_supply: i128,
    pub admin: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    TotalSupply,
    Balance(Address),
}

fn read_admin(e: &Env) -> Result<Address, TokenError> {
    e.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(TokenError::NotInitialized)
}

fn read_total_supply(e: &Env) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::TotalSupply)
        .unwrap_or(0)
}

fn read_balance(e: &Env, address: &Address) -> i128 {
    e.storage()
        .instance()
        .get(&DataKey::Balance(address.clone()))
        .unwrap_or(0)
}

fn write_balance(e: &Env, address: &Address, balance: i128) {
    e.storage()
        .instance()
        .set(&DataKey::Balance(address.clone()), &balance);
}

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(
        e: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
    ) -> Result<(), TokenError> {
        if e.storage().instance().has(&DataKey::Admin) {
            return Err(TokenError::AlreadyInitialized);
        }

        admin.require_auth();

        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::Name, &name);
        e.storage().instance().set(&DataKey::Symbol, &symbol);
        e.storage().instance().set(&DataKey::Decimals, &decimals);
        e.storage().instance().set(&DataKey::TotalSupply, &0_i128);

        Ok(())
    }

    pub fn mint(e: Env, to: Address, amount: i128) -> Result<(), TokenError> {
        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        let admin = read_admin(&e)?;
        admin.require_auth();

        let new_balance = read_balance(&e, &to) + amount;
        let new_total_supply = read_total_supply(&e) + amount;

        write_balance(&e, &to, new_balance);
        e.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_total_supply);

        Ok(())
    }

    pub fn transfer(e: Env, from: Address, to: Address, amount: i128) -> Result<(), TokenError> {
        if amount <= 0 {
            return Err(TokenError::InvalidAmount);
        }

        from.require_auth();

        let from_balance = read_balance(&e, &from);
        if from_balance < amount {
            return Err(TokenError::InsufficientBalance);
        }

        let to_balance = read_balance(&e, &to);
        write_balance(&e, &from, from_balance - amount);
        write_balance(&e, &to, to_balance + amount);

        Ok(())
    }

    pub fn balance(e: Env, owner: Address) -> i128 {
        read_balance(&e, &owner)
    }

    pub fn metadata(e: Env) -> Result<TokenMetadata, TokenError> {
        let admin = read_admin(&e)?;
        let name = e
            .storage()
            .instance()
            .get(&DataKey::Name)
            .ok_or(TokenError::NotInitialized)?;
        let symbol = e
            .storage()
            .instance()
            .get(&DataKey::Symbol)
            .ok_or(TokenError::NotInitialized)?;
        let decimals = e
            .storage()
            .instance()
            .get(&DataKey::Decimals)
            .ok_or(TokenError::NotInitialized)?;

        Ok(TokenMetadata {
            name,
            symbol,
            decimals,
            total_supply: read_total_supply(&e),
            admin,
        })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, String};

    fn setup() -> (Env, Address, Address) {
        let e = Env::default();
        let admin = Address::generate(&e);
        let user = Address::generate(&e);
        (e, admin, user)
    }

    fn client<'a>(e: &'a Env) -> TokenContractClient<'a> {
        let contract_id = e.register(TokenContract, ());
        TokenContractClient::new(e, &contract_id)
    }

    fn init_contract(e: &Env, client: &TokenContractClient<'_>, admin: &Address) {
        e.mock_all_auths();
        client.initialize(
            admin,
            &String::from_str(e, "Stellar Vault Token"),
            &String::from_str(e, "SVT"),
            &7,
        );
    }

    #[test]
    fn initialize_sets_metadata() {
        let (e, admin, _) = setup();
        let client = client(&e);
        init_contract(&e, &client, &admin);

        let metadata = client.metadata();
        assert_eq!(metadata.name, String::from_str(&e, "Stellar Vault Token"));
        assert_eq!(metadata.symbol, String::from_str(&e, "SVT"));
        assert_eq!(metadata.decimals, 7);
        assert_eq!(metadata.total_supply, 0);
        assert_eq!(metadata.admin, admin);
    }

    #[test]
    fn mint_increases_supply_and_balance() {
        let (e, admin, user) = setup();
        let client = client(&e);
        init_contract(&e, &client, &admin);

        client.mint(&user, &1_500);

        assert_eq!(client.balance(&user), 1_500);
        assert_eq!(client.metadata().total_supply, 1_500);
    }

    #[test]
    fn transfer_moves_balance() {
        let (e, admin, user) = setup();
        let client = client(&e);
        let recipient = Address::generate(&e);
        init_contract(&e, &client, &admin);

        client.mint(&user, &2_000);
        client.transfer(&user, &recipient, &750);

        assert_eq!(client.balance(&user), 1_250);
        assert_eq!(client.balance(&recipient), 750);
        assert_eq!(client.metadata().total_supply, 2_000);
    }

    #[test]
    #[should_panic]
    fn rejects_invalid_mint_amount() {
        let (e, admin, user) = setup();
        let client = client(&e);
        init_contract(&e, &client, &admin);

        client.mint(&user, &0);
    }

    #[test]
    #[should_panic]
    fn rejects_invalid_transfer_amount() {
        let (e, admin, user) = setup();
        let client = client(&e);
        init_contract(&e, &client, &admin);

        client.transfer(&user, &admin, &0);
    }

    #[test]
    #[should_panic]
    fn rejects_insufficient_balance() {
        let (e, admin, user) = setup();
        let client = client(&e);
        let recipient = Address::generate(&e);
        init_contract(&e, &client, &admin);

        client.transfer(&user, &recipient, &1);
    }
}
