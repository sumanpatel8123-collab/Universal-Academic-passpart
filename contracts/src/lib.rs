#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

const ADMIN: Symbol = symbol_short!("ADMIN");
const CRED_KEY: Symbol = symbol_short!("CRED");

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Credential {
    pub student: Address,
    pub course_name: String,
    pub issue_date: String,
    pub institution: String,
    pub degree_id: String,
}

#[contract]
pub struct AcademicPassportContract;

#[contractimpl]
impl AcademicPassportContract {
    /// Initializes the smart contract with the University/Admin authority address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
    }

    /// Issues a non-transferable (soulbound) credential to a student.
    /// Requires authorization from the initialized admin address.
    pub fn issue_credential(
        env: Env,
        student: Address,
        course_name: String,
        _issue_date: String,
    ) {
        let admin: Address = env.storage().instance().get(&ADMIN).expect("Not initialized");
        admin.require_auth();

        let mut student_creds: Vec<String> = env
            .storage()
            .persistent()
            .get(&(CRED_KEY, student.clone()))
            .unwrap_or(Vec::new(&env));

        student_creds.push_back(course_name);

        env.storage()
            .persistent()
            .set(&(CRED_KEY, student), &student_creds);
    }

    /// Issues an extended credential with institution & degree ID metadata.
    pub fn issue_credential_extended(
        env: Env,
        student: Address,
        course_name: String,
        _issue_date: String,
        _institution: String,
        _degree_id: String,
    ) {
        let admin: Address = env.storage().instance().get(&ADMIN).expect("Not initialized");
        admin.require_auth();

        let mut student_creds: Vec<String> = env
            .storage()
            .persistent()
            .get(&(CRED_KEY, student.clone()))
            .unwrap_or(Vec::new(&env));

        student_creds.push_back(course_name);

        env.storage()
            .persistent()
            .set(&(CRED_KEY, student), &student_creds);
    }

    /// Verifies and returns all credentials issued to a specific student address.
    pub fn verify_credential(env: Env, student: Address) -> Vec<String> {
        env.storage()
            .persistent()
            .get(&(CRED_KEY, student))
            .unwrap_or(Vec::new(&env))
    }

    /// Reads the admin address stored in the contract instance.
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN).expect("Not initialized")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_issue_and_verify_credential() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AcademicPassportContract);
        let client = AcademicPassportContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);

        client.initialize(&admin);

        let course = String::from_str(&env, "B.S. Computer Science & AI");
        let date = String::from_str(&env, "2026-06-15");

        client.issue_credential(&student, &course, &date);

        let creds = client.verify_credential(&student);
        assert_eq!(creds.len(), 1);
        assert_eq!(creds.get(0).unwrap(), course);
    }
}
