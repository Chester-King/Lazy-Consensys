import { Idl } from "@project-serum/anchor";
import { Lazycon } from "../target/types/lazycon";
export const idl: Lazycon = {
  "version": "0.1.0",
  "name": "lazycon",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "mintKey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createProposal",
      "accounts": [
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "useraddress",
          "type": "publicKey"
        },
        {
          "name": "amounttransfer",
          "type": "u64"
        }
      ]
    },
    {
      "name": "votesProposal",
      "accounts": [
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        },
        {
          "name": "expiryTime",
          "type": "u64"
        },
        {
          "name": "userAddresses",
          "type": "publicKey"
        },
        {
          "name": "amountTransfer",
          "type": "u64"
        }
      ]
    },
    {
      "name": "execute",
      "accounts": [
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "lockTokens",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfTokenBeingSent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lockTokens",
          "type": "u64"
        }
      ]
    },
    {
      "name": "lockTokensAgain",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfTokenBeingSent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultBump",
          "type": "u8"
        },
        {
          "name": "lockedTokens",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlockTokens",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposalAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintOfTokenBeingSent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultBump",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "proposalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "expiryTime",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "userAddresses",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "amountTransfer",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "votesProposal",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "keysVoted",
            "type": {
              "vec": {
                "vec": "publicKey"
              }
            }
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "mintKey",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "votingPower",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "lockTime",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "WrongInput"
    },
    {
      "code": 6001,
      "name": "TimeError"
    },
    {
      "code": 6002,
      "name": "SameUser"
    },
    {
      "code": 6003,
      "name": "WrongUser"
    },
    {
      "code": 6004,
      "name": "ChallengeNotExpired"
    },
    {
      "code": 6005,
      "name": "ChallengeExpired"
    },
    {
      "code": 6006,
      "name": "NoFullConsent"
    },
    {
      "code": 6007,
      "name": "NotEnoughFunds"
    },
    {
      "code": 6008,
      "name": "VotingAgain"
    },
    {
      "code": 6009,
      "name": "LockPeriodNotEnded"
    }
  ]
}