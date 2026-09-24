window.CASES_DATA = {
  "HHG-001": {
    "case_id": "HHG-001",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3514030 fits established customer behavior: customer has 351 prior transactions with habitual billing in region 444.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3514030"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0003",
        "CC-0009"
      ],
      "summary": "Alert triggered by risk_score for $77.07 on card C12382-K1. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-001"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: single risk score under 0.70; verify with cardholder before blocking"
        },
        {
          "action": "MONITOR_CARD",
          "route": "auto",
          "reason": "Raise monitoring sensitivity pending customer response"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 3,
    "tokens": 1570,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-05 01:55:28",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3514030 ($77.07, in billing region 444.0) at 0.61. Review and decide.",
      "flagged_txn_id": 3514030,
      "card_id": "C12382-K1",
      "customer_id": "C12382",
      "risk_score": 0.61
    }
  },
  "HHG-002": {
    "case_id": "HHG-002",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3478782 fits established customer behavior: customer has 35 prior transactions with habitual billing in region nan.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3478782"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0003",
        "CC-0009"
      ],
      "summary": "Alert triggered by risk_score for $292.36 on card C11891-K1. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-002"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 3,
    "tokens": 1574,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-22 23:27:07",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3478782 ($292.36, online) at 0.79. Review and decide.",
      "flagged_txn_id": 3478782,
      "card_id": "C11891-K1",
      "customer_id": "C11891",
      "risk_score": 0.79
    }
  },
  "HHG-003": {
    "case_id": "HHG-003",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "out_of_region_use",
      "pattern_description": "",
      "affected_txn_ids": [
        "3530164"
      ],
      "first_suspicious_txn_id": "3530164",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 49.0,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3530164 ($49.00) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3530164"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0002",
        "CC-0005"
      ],
      "summary": "Investigation confirmed out of region use on card C08623-K2 totaling $49.00 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-003"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $49.00)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 3,
    "tokens": 1598,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-10 15:01:21",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C08623 message: 'I never made this $49.00 purchase. Please check my card.' Refers to 3530164.",
      "flagged_txn_id": 3530164,
      "card_id": "C08623-K2",
      "customer_id": "C08623",
      "risk_score": null
    }
  },
  "HHG-004": {
    "case_id": "HHG-004",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "card_not_present_new_device",
      "pattern_description": "",
      "affected_txn_ids": [
        "3583227"
      ],
      "first_suspicious_txn_id": "3583227",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "|  | firefox 47.0 |"
      ],
      "exposure_usd": 128.33,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3583227 ($128.33) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3583227"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0011",
        "CC-0018"
      ],
      "summary": "Investigation confirmed card not present new device on card C08106-K1 totaling $128.33 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-004"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $128.33)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 1642,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-29 07:53:54",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C08106 message: 'I never made this $128.33 purchase. Please check my card.' Refers to 3583227.",
      "flagged_txn_id": 3583227,
      "card_id": "C08106-K1",
      "customer_id": "C08106",
      "risk_score": null
    }
  },
  "HHG-005": {
    "case_id": "HHG-005",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [
        "C02342-K1",
        "C09872-K1",
        "C04108-K1",
        "C12961-K1",
        "C03278-K1",
        "C02716-K1",
        "C03787-K1",
        "C02354-K1",
        "C11898-K1",
        "C01155-K1",
        "C07212-K1",
        "C12166-K1",
        "C06947-K1",
        "C03412-K1",
        "C12942-K1",
        "C05385-K1",
        "C08299-K1",
        "C10955-K1",
        "C07518-K1",
        "C04547-K1",
        "C13058-K1",
        "C07615-K1",
        "C07987-K1",
        "C02250-K1",
        "C06568-K1",
        "C01104-K1",
        "C10948-K1",
        "C03096-K1",
        "C06962-K1",
        "C13067-K1",
        "C13440-K1",
        "C01953-K1",
        "C01154-K1",
        "C09800-K1",
        "C06224-K1",
        "C11000-K1",
        "C12484-K1",
        "C05958-K1",
        "C01138-K1",
        "C01982-K1",
        "C05063-K1",
        "C06481-K1",
        "C01782-K1",
        "C06208-K1",
        "C02024-K1",
        "C00854-K1",
        "C08989-K1",
        "C05704-K1",
        "C09363-K1",
        "C08348-K1",
        "C03066-K1",
        "C08918-K1",
        "C10542-K1",
        "C08542-K1",
        "C03575-K1",
        "C02231-K1",
        "C06220-K1",
        "C12585-K1",
        "C00750-K1",
        "C11257-K1",
        "C08925-K1",
        "C12598-K1",
        "C11164-K1",
        "C12450-K1",
        "C04942-K1",
        "C02393-K1",
        "C00450-K1",
        "C09468-K1",
        "C02780-K1",
        "C07552-K1",
        "C04803-K1",
        "C11539-K1",
        "C10964-K1",
        "C03218-K1",
        "C05690-K1",
        "C07847-K1",
        "C05345-K1",
        "C12230-K1",
        "C00329-K1",
        "C06296-K1",
        "C04513-K1",
        "C08999-K1",
        "C01619-K1",
        "C03623-K1",
        "C03040-K1",
        "C01128-K1",
        "C06005-K1",
        "C09149-K1",
        "C06835-K1",
        "C04194-K1",
        "C07612-K1",
        "C12748-K1",
        "C03273-K1",
        "C07355-K1",
        "C04117-K1",
        "C13316-K1",
        "C11929-K1",
        "C05551-K1",
        "C00913-K1",
        "C04173-K1",
        "C08489-K1",
        "C03047-K1",
        "C01909-K1",
        "C08780-K1",
        "C06708-K1",
        "C11522-K1",
        "C06279-K1",
        "C01599-K1",
        "C08410-K1",
        "C11496-K1",
        "C12267-K1"
      ],
      "connected_device_profiles": [
        "iOS Device | iOS 9.3.5 | mobile safari 9.0 | 1024x768"
      ],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3523199 fits established customer behavior: customer has 90 prior transactions with habitual billing in region 330.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3523199"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0018",
        "CC-0033"
      ],
      "summary": "Alert triggered by risk_score for $100.07 on card C02923-K1. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-005"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: single risk score under 0.70; verify with cardholder before blocking"
        },
        {
          "action": "MONITOR_CARD",
          "route": "auto",
          "reason": "Raise monitoring sensitivity pending customer response"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 4,
    "tokens": 1574,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-08 03:38:37",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3523199 ($100.07, online) at 0.54. Review and decide.",
      "flagged_txn_id": 3523199,
      "card_id": "C02923-K1",
      "customer_id": "C02923",
      "risk_score": 0.54
    }
  },
  "HHG-006": {
    "case_id": "HHG-006",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.92,
      "pattern": "undocumented",
      "pattern_description": "Repeated online authorization burst just beneath the $500 monitoring threshold within 40 minutes, indicating intentional threshold evasion (structuring) by an unauthorized actor.",
      "affected_txn_ids": [
        "3476602",
        "3476633",
        "3476665",
        "3476682"
      ],
      "first_suspicious_txn_id": "3476602",
      "connected_card_ids": [
        "C12942-K1",
        "C04157-K1",
        "C05704-K1",
        "C06599-K1",
        "C08842-K1",
        "C09165-K1",
        "C06224-K1",
        "C03648-K1",
        "C11000-K1",
        "C04832-K1",
        "C08072-K1",
        "C02231-K1",
        "C04108-K1",
        "C00750-K1",
        "C10349-K1",
        "C13410-K1",
        "C06590-K1",
        "C05560-K1",
        "C07648-K1",
        "C04660-K1",
        "C00990-K1",
        "C10827-K1",
        "C08179-K1",
        "C12897-K1",
        "C06947-K1",
        "C07462-K1",
        "C12961-K1",
        "C07518-K1",
        "C03474-K1",
        "C00450-K1",
        "C03708-K1",
        "C13266-K1",
        "C07871-K1",
        "C01620-K1",
        "C07987-K1",
        "C03184-K1",
        "C11486-K1",
        "C02354-K1",
        "C09711-K1",
        "C01966-K1",
        "C11806-K1",
        "C06302-K1",
        "C00180-K1",
        "C08450-K1",
        "C05970-K1",
        "C01155-K1",
        "C02902-K1",
        "C00704-K1",
        "C03448-K1",
        "C07311-K1",
        "C11792-K1",
        "C12682-K1",
        "C09301-K1",
        "C06220-K1",
        "C01494-K1",
        "C05509-K1",
        "C02285-K1",
        "C10187-K1",
        "C03019-K1",
        "C05584-K1",
        "C07755-K1",
        "C12124-K1",
        "C03018-K1",
        "C00768-K1",
        "C12454-K1",
        "C09241-K1",
        "C07212-K1",
        "C03066-K1",
        "C07944-K1",
        "C05245-K1",
        "C00854-K1",
        "C07196-K1",
        "C05480-K1",
        "C04776-K1",
        "C01154-K1",
        "C12001-K1",
        "C08989-K1",
        "C05641-K1",
        "C00542-K1",
        "C05368-K1",
        "C07924-K1",
        "C03040-K1",
        "C10023-K1",
        "C00149-K1",
        "C09249-K1",
        "C02716-K1",
        "C07492-K1",
        "C04500-K1",
        "C12489-K1",
        "C04537-K1",
        "C02250-K1",
        "C00667-K1",
        "C12825-K1",
        "C03093-K1",
        "C08856-K1",
        "C04346-K1",
        "C03218-K1",
        "C10601-K1",
        "C13067-K1",
        "C08256-K1",
        "C10955-K1",
        "C11489-K1",
        "C11237-K1",
        "C08748-K1",
        "C02128-K1",
        "C04970-K1",
        "C11709-K1",
        "C09460-K1",
        "C08945-K1",
        "C13328-K1",
        "C02055-K1",
        "C01204-K1",
        "C04077-K1",
        "C03242-K1",
        "C07782-K1",
        "C13245-K1",
        "C07356-K1",
        "C12211-K1",
        "C04968-K1",
        "C01936-K1",
        "C09274-K1",
        "C00386-K1",
        "C07071-K1",
        "C00908-K1",
        "C08466-K1",
        "C03778-K1",
        "C13005-K1",
        "C04294-K1",
        "C08761-K1",
        "C00877-K1",
        "C07858-K1",
        "C13518-K1",
        "C11450-K1",
        "C03341-K1",
        "C04965-K1",
        "C09251-K1",
        "C13525-K1",
        "C07119-K1",
        "C03158-K1",
        "C12983-K1",
        "C06775-K1",
        "C11543-K1",
        "C11003-K1",
        "C06026-K1",
        "C09680-K1",
        "C09873-K1",
        "C10223-K1",
        "C07089-K1",
        "C00536-K1",
        "C09612-K1",
        "C12920-K1",
        "C01182-K1",
        "C06482-K1",
        "C01255-K1",
        "C04860-K1",
        "C05290-K1",
        "C04125-K1",
        "C10292-K1",
        "C04834-K1",
        "C09800-K1",
        "C07948-K1",
        "C03549-K1",
        "C05244-K1",
        "C02400-K1",
        "C07340-K1",
        "C06221-K1",
        "C10068-K1",
        "C04046-K1",
        "C09363-K1",
        "C03317-K1",
        "C08807-K1",
        "C05930-K1",
        "C06075-K1",
        "C13429-K1",
        "C00094-K1",
        "C09227-K1",
        "C08742-K1",
        "C09606-K1",
        "C00230-K1",
        "C12690-K1",
        "C11269-K1",
        "C01493-K1",
        "C01492-K1",
        "C09149-K1",
        "C01017-K1",
        "C08269-K1",
        "C07614-K1",
        "C07011-K1",
        "C01333-K1",
        "C00560-K1",
        "C01843-K1",
        "C04313-K1",
        "C01330-K1",
        "C11522-K1",
        "C11575-K1",
        "C02646-K1",
        "C01743-K1",
        "C05690-K1",
        "C09691-K1",
        "C11097-K1",
        "C08283-K1",
        "C06511-K1",
        "C10245-K1",
        "C11684-K1",
        "C03598-K1",
        "C00134-K1",
        "C12166-K1",
        "C05530-K1",
        "C07936-K1",
        "C02106-K1",
        "C11929-K1",
        "C09981-K1",
        "C07606-K1",
        "C09654-K1",
        "C12992-K1",
        "C05856-K1",
        "C04865-K1",
        "C12094-K1",
        "C11548-K1",
        "C07909-K1",
        "C08918-K1",
        "C07612-K1",
        "C09918-K1",
        "C00197-K1",
        "C02410-K1",
        "C06677-K1",
        "C12710-K1",
        "C08251-K1",
        "C08616-K1",
        "C00844-K1",
        "C07925-K1",
        "C10842-K1",
        "C05083-K1",
        "C09868-K1",
        "C12774-K1",
        "C07558-K1",
        "C09586-K1",
        "C05266-K1",
        "C08634-K1",
        "C12730-K1",
        "C12249-K1",
        "C03843-K1",
        "C09926-K1",
        "C10755-K1",
        "C10553-K1",
        "C01744-K1",
        "C08489-K1",
        "C00465-K1",
        "C11227-K1",
        "C11294-K1",
        "C09007-K1",
        "C07698-K1",
        "C01672-K1",
        "C04352-K1",
        "C02121-K1",
        "C06708-K1",
        "C04525-K1",
        "C08375-K1",
        "C12216-K1",
        "C11700-K1",
        "C11544-K1",
        "C01137-K1",
        "C13448-K1",
        "C05585-K1",
        "C05551-K1",
        "C08999-K1",
        "C03872-K1",
        "C00452-K1",
        "C01109-K1",
        "C08994-K1",
        "C06001-K1",
        "C08746-K1",
        "C09206-K1",
        "C09718-K1",
        "C08285-K1",
        "C00889-K1",
        "C01688-K1",
        "C01104-K1",
        "C07130-K1",
        "C08339-K1",
        "C11413-K1",
        "C06025-K1",
        "C03278-K1",
        "C11513-K1",
        "C07004-K1",
        "C10771-K1",
        "C03067-K1",
        "C01285-K1",
        "C10099-K1",
        "C08637-K1",
        "C09511-K1",
        "C13351-K1",
        "C08475-K1",
        "C00436-K1",
        "C01014-K1",
        "C12622-K1",
        "C11772-K1",
        "C03394-K1",
        "C09803-K1",
        "C07760-K1",
        "C09430-K1",
        "C10692-K1",
        "C07180-K1",
        "C12901-K1",
        "C02883-K1",
        "C11633-K1",
        "C02418-K1",
        "C08286-K1",
        "C01982-K1",
        "C08926-K1",
        "C07473-K1",
        "C05772-K1",
        "C12267-K1",
        "C06835-K1",
        "C06670-K1",
        "C05630-K1",
        "C02609-K1",
        "C03306-K1",
        "C02502-K1",
        "C04533-K1",
        "C08598-K1",
        "C00853-K1",
        "C03999-K1",
        "C04307-K1",
        "C03374-K1",
        "C10293-K1",
        "C08011-K1",
        "C05347-K1",
        "C09863-K1",
        "C03738-K1",
        "C02334-K1",
        "C07164-K1",
        "C11609-K1",
        "C04258-K1",
        "C04134-K1",
        "C06962-K1",
        "C12150-K1",
        "C04903-K1",
        "C12434-K1",
        "C03906-K1",
        "C11889-K1",
        "C02342-K1",
        "C11496-K1",
        "C08080-K1",
        "C13427-K1",
        "C03657-K1",
        "C04244-K1",
        "C10158-K1",
        "C10578-K1",
        "C06565-K1",
        "C07091-K1",
        "C09933-K1",
        "C12386-K1",
        "C06770-K1",
        "C06208-K1",
        "C04984-K1",
        "C04831-K1",
        "C07957-K1",
        "C10016-K1",
        "C11143-K1",
        "C13287-K1",
        "C04798-K1",
        "C02138-K1",
        "C10520-K1",
        "C07901-K1",
        "C09899-K1",
        "C07641-K1",
        "C07185-K1",
        "C09471-K1",
        "C09212-K1",
        "C08141-K1",
        "C13537-K1",
        "C08557-K1",
        "C11704-K1",
        "C00329-K1",
        "C02810-K1",
        "C06117-K1",
        "C02094-K1",
        "C03902-K1",
        "C08334-K1",
        "C11662-K1",
        "C09281-K1",
        "C03047-K1",
        "C11178-K1",
        "C03957-K1",
        "C04182-K1",
        "C02831-K1",
        "C04106-K1",
        "C06190-K1",
        "C04928-K1",
        "C08943-K1",
        "C05468-K1",
        "C01909-K1",
        "C10998-K1",
        "C07867-K1",
        "C10527-K1",
        "C00782-K1",
        "C01738-K1",
        "C02033-K1",
        "C08374-K1",
        "C05419-K1",
        "C11965-K1",
        "C05141-K1",
        "C00967-K1",
        "C07102-K1",
        "C06244-K1",
        "C07531-K1",
        "C10170-K1",
        "C10127-K1",
        "C02279-K1",
        "C12419-K1",
        "C03684-K1",
        "C09956-K1",
        "C08780-K1",
        "C08382-K1",
        "C01205-K1",
        "C03327-K1",
        "C04697-K1",
        "C00867-K1",
        "C00942-K1",
        "C10614-K1",
        "C10889-K1",
        "C12061-K1",
        "C12768-K1",
        "C04220-K1",
        "C11309-K1",
        "C06515-K1",
        "C05304-K1",
        "C06024-K1",
        "C12286-K1",
        "C13028-K1",
        "C02542-K1",
        "C02695-K1",
        "C06944-K1",
        "C09861-K1",
        "C11133-K1",
        "C07815-K1",
        "C03405-K1",
        "C06092-K1",
        "C06130-K1",
        "C02904-K1",
        "C11287-K1",
        "C02000-K1",
        "C02036-K1",
        "C03595-K1",
        "C08789-K1",
        "C03933-K1",
        "C12620-K1",
        "C02728-K1",
        "C04795-K1",
        "C07169-K1",
        "C10736-K1",
        "C03412-K1",
        "C00118-K1",
        "C13177-K1",
        "C01755-K1",
        "C03494-K1",
        "C09602-K1",
        "C08482-K1",
        "C03856-K1",
        "C09026-K1",
        "C04759-K1",
        "C11298-K1",
        "C01374-K1",
        "C06800-K1",
        "C02458-K1",
        "C03838-K1",
        "C10194-K1",
        "C12840-K1",
        "C10713-K1",
        "C07585-K1",
        "C00537-K1",
        "C06958-K1",
        "C12658-K1",
        "C12755-K1",
        "C09826-K1",
        "C04571-K1",
        "C06201-K1",
        "C09442-K1",
        "C09420-K1",
        "C11539-K1",
        "C09443-K1",
        "C01165-K1",
        "C03983-K1",
        "C05146-K1",
        "C08833-K1",
        "C00288-K1",
        "C06976-K1",
        "C05868-K1",
        "C07171-K1",
        "C02859-K1",
        "C10448-K1",
        "C11865-K1",
        "C11193-K1",
        "C11385-K1",
        "C13086-K1",
        "C09468-K1",
        "C02360-K1",
        "C00941-K1",
        "C00679-K1",
        "C05052-K1",
        "C03125-K1",
        "C08496-K1",
        "C05809-K1",
        "C00555-K1",
        "C06005-K1",
        "C01144-K1",
        "C03247-K1",
        "C02079-K1",
        "C05848-K1",
        "C07437-K1",
        "C12762-K1",
        "C08791-K1",
        "C12592-K1",
        "C03215-K1",
        "C01864-K1",
        "C13264-K1",
        "C00502-K1",
        "C01116-K1",
        "C08796-K1",
        "C04592-K1",
        "C11381-K1",
        "C12532-K1",
        "C04778-K1",
        "C03538-K1",
        "C12842-K1",
        "C05891-K1",
        "C09681-K1",
        "C01196-K1",
        "C01721-K1",
        "C00626-K1",
        "C04118-K1",
        "C00892-K1",
        "C10295-K1",
        "C10149-K1",
        "C08305-K1",
        "C02114-K1",
        "C02830-K1",
        "C09757-K1",
        "C03043-K1",
        "C09789-K1",
        "C10012-K1"
      ],
      "connected_device_profiles": [
        "Trident/7.0 | Windows 7 | ie 11.0 for desktop | 1920x1080"
      ],
      "exposure_usd": 1906.07,
      "evidence": [
        {
          "claim": "Burst of 4 online authorizations each between $450 and $490 within 30 minutes, structured to evade $500 threshold controls.",
          "source": "graph",
          "ref": "query:card_window(card_id, hours=2)",
          "entity_ids": [
            "3476602",
            "3476633",
            "3476665",
            "3476682"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-3748",
        "CC-3841"
      ],
      "summary": "Investigation confirmed undocumented on card C07297-K1 totaling $1906.07 across 4 transaction(s). Linked to 542 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-006"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer denies all four online transactions and confirms the card remains in their physical possession."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $1906.07)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        },
        {
          "action": "FILE_REPORT",
          "route": "L2",
          "reason": "Policy 3a: Mandatory SAR filing required under Policy 3a and exposure of $1906.07 exceeds regulatory $1,000 reporting threshold; activity connects to shared device profile or multi-card syndicate; activity exhibits coordinated or undocumented evasion pattern (Rule R9)."
        },
        {
          "action": "MONITOR_CONNECTED_CARDS",
          "route": "auto",
          "reason": "R6: 542 connected cards share compromised device profile"
        },
        {
          "action": "ESCALATE_TO_ANALYST",
          "route": "auto",
          "reason": "R9: novel undocumented coordinated pattern requires human analyst review"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.92. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": true,
      "reason": "Mandatory SAR filing required under Policy 3a and exposure of $1906.07 exceeds regulatory $1,000 reporting threshold; activity connects to shared device profile or multi-card syndicate; activity exhibits coordinated or undocumented evasion pattern (Rule R9).",
      "narrative": "Between 2016-11-21 and 2016-11-21, financial institution detection systems identified unauthorized activity on card C07297-K1, issued to customer C07297. The suspicious activity comprises 4 online transactions totaling $1,906.07 under merchant product classification(s) C, featuring individual transactions of $478.95, $456.96, $488.04, $482.12. Technical telemetry indicates these transactions originated through a distinct device profile (Trident/7.0 | Windows 7 | ie 11.0 for desktop | 1920x1080), identified as an uncharacteristic endpoint for the primary account holder. The activity represents an organized fraud mechanism: Repeated online authorization burst just beneath the $500 monitoring threshold within 40 minutes, indicating intentional threshold evasion (structuring) by an unauthorized actor.. Graph relationship traversal in TigerGraph revealed this fraudulent endpoint is shared across 542 additional cardholder account(s), specifically including C12942-K1, C04157-K1, C05704-K1, establishing a coordinated fraud ring. Following automated security outreach, customer denies all four online transactions and confirms the card remains in their physical possession., affirming that the charges were fully unauthorized. In accordance with Bank Fraud Policy and BSA/AML regulatory requirements, card C07297-K1 was immediately blocked and queued for reissue, connected accounts were placed under heightened monitoring, and total bank exposure was contained at $1,906.07.",
      "subjects": [
        "C07297",
        "C07297-K1",
        "C12942-K1",
        "C04157-K1",
        "C05704-K1",
        "C06599-K1",
        "C08842-K1",
        "Trident/7.0"
      ],
      "total_amount_usd": 1906.07,
      "activity_dates": [
        "2016-11-21",
        "2016-11-21"
      ]
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 7522,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-22 02:30:00",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C07297 message: 'I never made this $482.12 purchase. Please check my card.' Refers to 3476682.",
      "flagged_txn_id": 3476682,
      "card_id": "C07297-K1",
      "customer_id": "C07297",
      "risk_score": null
    }
  },
  "HHG-007": {
    "case_id": "HHG-007",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3514948 fits established customer behavior: customer has 2410 prior transactions with habitual billing in region 264.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3514948"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0003",
        "CC-0009"
      ],
      "summary": "Alert triggered by risk_score for $111.92 on card C09933-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-007"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 3,
    "tokens": 1574,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-05 03:46:14",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3514948 ($111.92, in billing region 264.0) at 0.87. Review and decide.",
      "flagged_txn_id": 3514948,
      "card_id": "C09933-K2",
      "customer_id": "C09933",
      "risk_score": 0.87
    }
  },
  "HHG-008": {
    "case_id": "HHG-008",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "card_not_present_fraud",
      "pattern_description": "",
      "affected_txn_ids": [
        "3558054"
      ],
      "first_suspicious_txn_id": "3558054",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "|  | chrome 66.0 |"
      ],
      "exposure_usd": 55.68,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3558054 ($55.68) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3558054"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0001",
        "CC-0007"
      ],
      "summary": "Investigation confirmed card not present fraud on card C13171-K2 totaling $55.68 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-008"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $55.68)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 1618,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-20 03:08:56",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C13171 message: 'I never made this $55.68 purchase. Please check my card.' Refers to 3558054.",
      "flagged_txn_id": 3558054,
      "card_id": "C13171-K2",
      "customer_id": "C13171",
      "risk_score": null
    }
  },
  "HHG-009": {
    "case_id": "HHG-009",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "card_not_present_fraud",
      "pattern_description": "",
      "affected_txn_ids": [
        "3581141"
      ],
      "first_suspicious_txn_id": "3581141",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "|  |  |"
      ],
      "exposure_usd": 30.02,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3581141 ($30.02) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3581141"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0007",
        "CC-0012"
      ],
      "summary": "Investigation confirmed card not present fraud on card C08299-K1 totaling $30.02 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-009"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $30.02)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 1618,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-28 17:10:53",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C08299 message: 'I never made this $30.02 purchase. Please check my card.' Refers to 3581141.",
      "flagged_txn_id": 3581141,
      "card_id": "C08299-K1",
      "customer_id": "C08299",
      "risk_score": null
    }
  },
  "HHG-010": {
    "case_id": "HHG-010",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.86,
      "pattern": "card_not_present_new_device",
      "pattern_description": "",
      "affected_txn_ids": [
        "3506725"
      ],
      "first_suspicious_txn_id": "3506725",
      "connected_card_ids": [
        "C09165-K1",
        "C11485-K1",
        "C09683-K1",
        "C10324-K1",
        "C03019-K1",
        "C04776-K1",
        "C01982-K1",
        "C12420-K1",
        "C07212-K1",
        "C02608-K1",
        "C10045-K1",
        "C03851-K1",
        "C09708-K1",
        "C02231-K1",
        "C01155-K1",
        "C07105-K1",
        "C04108-K1",
        "C05125-K1",
        "C11000-K1",
        "C01755-K1",
        "C02716-K1",
        "C11730-K1",
        "C04346-K1",
        "C10127-K1",
        "C05611-K1",
        "C06224-K1",
        "C00854-K1",
        "C02319-K1",
        "C03878-K1",
        "C06130-K1",
        "C07612-K1",
        "C05704-K1",
        "C09241-K1",
        "C09873-K1",
        "C12887-K1",
        "C11543-K1",
        "C04865-K1",
        "C03302-K1",
        "C01377-K1",
        "C10390-K1",
        "C00416-K1",
        "C02309-K1",
        "C05245-K1",
        "C01977-K1",
        "C09301-K1",
        "C00750-K1",
        "C01186-K1",
        "C06223-K1",
        "C03146-K1",
        "C12439-K1",
        "C12897-K1",
        "C07871-K1",
        "C09274-K1",
        "C12942-K1",
        "C07185-K1",
        "C08483-K1",
        "C13015-K1",
        "C11496-K1",
        "C09141-K1",
        "C05560-K1",
        "C03278-K1",
        "C07227-K1",
        "C04077-K1",
        "C05362-K1",
        "C11309-K1",
        "C09283-K1",
        "C12626-K1",
        "C07812-K1",
        "C12514-K1",
        "C04361-K1",
        "C10559-K1",
        "C05351-K1",
        "C02883-K1",
        "C03047-K1",
        "C01909-K1",
        "C06798-K1",
        "C06005-K1",
        "C02902-K1",
        "C04125-K1",
        "C07987-K1",
        "C01563-K1",
        "C11194-K1",
        "C10766-K1",
        "C08331-K1",
        "C05654-K1",
        "C10867-K1",
        "C12983-K1",
        "C09265-K1",
        "C07685-K1",
        "C04134-K1",
        "C11709-K1",
        "C01104-K1",
        "C09807-K1",
        "C04840-K1",
        "C09174-K1",
        "C06958-K1",
        "C06208-K1",
        "C10955-K1",
        "C07416-K1",
        "C01138-K1",
        "C01721-K1",
        "C05868-K1",
        "C10149-K1",
        "C08064-K1",
        "C11700-K1",
        "C10996-K1",
        "C04294-K1",
        "C00659-K1",
        "C03738-K1",
        "C00787-K1",
        "C03856-K1",
        "C08522-K1",
        "C03040-K1",
        "C13067-K1",
        "C00942-K1",
        "C12682-K1",
        "C03714-K1",
        "C11196-K1",
        "C01152-K1",
        "C09471-K1",
        "C06699-K1",
        "C05625-K1",
        "C10986-K1",
        "C12194-K1",
        "C03066-K1",
        "C04566-K1",
        "C03528-K1",
        "C12900-K1",
        "C06630-K1",
        "C09280-K1",
        "C07648-K1",
        "C00307-K1",
        "C10553-K1",
        "C04277-K1",
        "C05128-K1",
        "C09507-K1",
        "C06228-K1",
        "C02999-K1",
        "C03778-K1",
        "C04683-K1",
        "C05175-K1",
        "C12975-K1",
        "C06947-K1",
        "C12166-K1",
        "C12961-K1",
        "C05585-K1",
        "C05772-K1",
        "C13058-K1",
        "C03817-K1",
        "C07858-K1",
        "C06024-K1",
        "C06190-K1",
        "C04046-K1",
        "C13145-K1",
        "C02354-K1",
        "C01828-K1",
        "C10365-K1",
        "C00450-K1",
        "C01966-K1",
        "C01730-K1",
        "C06026-K1",
        "C01814-K1",
        "C08269-K1",
        "C03533-K1",
        "C02280-K1",
        "C08918-K1",
        "C09249-K1",
        "C06914-K1",
        "C04269-K1",
        "C10308-K1",
        "C08489-K1",
        "C07780-K1",
        "C03169-K1",
        "C12690-K1",
        "C09065-K1",
        "C05244-K1",
        "C04024-K1",
        "C06308-K1",
        "C01999-K1",
        "C11381-K1",
        "C03343-K1",
        "C06818-K1",
        "C05508-K1",
        "C02250-K1",
        "C08989-K1",
        "C02848-K1",
        "C11143-K1",
        "C02377-K1",
        "C07552-K1",
        "C01688-K1",
        "C04860-K1",
        "C03218-K1",
        "C07745-K1",
        "C03036-K1",
        "C10507-K1",
        "C03285-K1",
        "C04265-K1",
        "C09363-K1",
        "C11929-K1",
        "C07338-K1",
        "C07518-K1",
        "C04190-K1",
        "C02285-K1",
        "C07925-K1",
        "C05814-K1",
        "C02079-K1",
        "C06070-K1"
      ],
      "connected_device_profiles": [
        "Windows | Windows 10 | edge 16.0 | 1366x768"
      ],
      "exposure_usd": 1000.03,
      "evidence": [
        {
          "claim": "High risk score 0.9 with large amount $1000.03 initiated from newly registered device profile Windows | Windows 10 | edge 16.0 | 1366x768.",
          "source": "graph",
          "ref": "query:card_window(card_id, hours=24)",
          "entity_ids": [
            "3506725"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0507",
        "CC-0949"
      ],
      "summary": "Investigation confirmed card not present new device on card C10434-K1 totaling $1000.03 across 1 transaction(s). Linked to 207 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-010"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer contacted via priority outreach and stated they did not initiate this high-value purchase from a new device."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $1000.03)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        },
        {
          "action": "FILE_REPORT",
          "route": "L2",
          "reason": "Policy 3a: Mandatory SAR filing required under Policy 3a and exposure of $1000.03 exceeds regulatory $1,000 reporting threshold; activity connects to shared device profile or multi-card syndicate."
        },
        {
          "action": "MONITOR_CONNECTED_CARDS",
          "route": "auto",
          "reason": "R6: 207 connected cards share compromised device profile"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.86. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": true,
      "reason": "Mandatory SAR filing required under Policy 3a and exposure of $1000.03 exceeds regulatory $1,000 reporting threshold; activity connects to shared device profile or multi-card syndicate.",
      "narrative": "Between 2016-12-02 and 2016-12-02, financial institution detection systems identified unauthorized activity on card C10434-K1, issued to customer C10434. The suspicious activity comprises 1 online transactions totaling $1,000.03 under merchant product classification(s) R, featuring individual transactions of $1000.03. Technical telemetry indicates these transactions originated through a distinct device profile (Windows | Windows 10 | edge 16.0 | 1366x768), identified as an uncharacteristic endpoint for the primary account holder. The card number was utilized online from a previously unseen device profile without customer authentication, characteristic of card-not-present fraud following card data exfiltration. Graph relationship traversal in TigerGraph revealed this fraudulent endpoint is shared across 207 additional cardholder account(s), specifically including C09165-K1, C11485-K1, C09683-K1, establishing a coordinated fraud ring. Following automated security outreach, customer contacted via priority outreach and stated they did not initiate this high-value purchase from a new device., affirming that the charges were fully unauthorized. In accordance with Bank Fraud Policy and BSA/AML regulatory requirements, card C10434-K1 was immediately blocked and queued for reissue, connected accounts were placed under heightened monitoring, and total bank exposure was contained at $1,000.03.",
      "subjects": [
        "C10434",
        "C10434-K1",
        "C09165-K1",
        "C11485-K1",
        "C09683-K1",
        "C10324-K1",
        "C03019-K1",
        "Windows"
      ],
      "total_amount_usd": 1000.03,
      "activity_dates": [
        "2016-12-02",
        "2016-12-02"
      ]
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 7274,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-02 18:18:27",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3506725 ($1,000.03, online) at 0.90. Review and decide.",
      "flagged_txn_id": 3506725,
      "card_id": "C10434-K1",
      "customer_id": "C10434",
      "risk_score": 0.9
    }
  },
  "HHG-011": {
    "case_id": "HHG-011",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "card_not_present_new_device",
      "pattern_description": "",
      "affected_txn_ids": [
        "3583368"
      ],
      "first_suspicious_txn_id": "3583368",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "SM-G610F Build/NRD90M |  | chrome 66.0 for android |"
      ],
      "exposure_usd": 131.3,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3583368 ($131.30) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3583368"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0011",
        "CC-0018"
      ],
      "summary": "Investigation confirmed card not present new device on card C11923-K2 totaling $131.30 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-011"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $131.30)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 1642,
    "latency_s": 0.02,
    "pack_meta": {
      "opened_at": "2016-12-29 06:27:44",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C11923 message: 'I never made this $131.30 purchase. Please check my card.' Refers to 3583368.",
      "flagged_txn_id": 3583368,
      "card_id": "C11923-K2",
      "customer_id": "C11923",
      "risk_score": null
    }
  },
  "HHG-012": {
    "case_id": "HHG-012",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3553342 fits established customer behavior: customer has 901 prior transactions with habitual billing in region 494.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3553342"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0003",
        "CC-0009"
      ],
      "summary": "Alert triggered by risk_score for $30.91 on card C05876-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-012"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: single risk score under 0.70; verify with cardholder before blocking"
        },
        {
          "action": "MONITOR_CARD",
          "route": "auto",
          "reason": "Raise monitoring sensitivity pending customer response"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 3,
    "tokens": 1570,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-18 05:00:31",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3553342 ($30.91, in billing region 494.0) at 0.55. Review and decide.",
      "flagged_txn_id": 3553342,
      "card_id": "C05876-K2",
      "customer_id": "C05876",
      "risk_score": 0.55
    }
  },
  "HHG-013": {
    "case_id": "HHG-013",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "Windows |  | chrome 66.0 |"
      ],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3526826 fits established customer behavior: customer has 1415 prior transactions with habitual billing in region nan.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3526826"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0014",
        "CC-0022"
      ],
      "summary": "Alert triggered by risk_score for $35.66 on card C07671-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-013"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 4,
    "tokens": 1570,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-09 05:39:29",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3526826 ($35.66, online) at 0.76. Review and decide.",
      "flagged_txn_id": 3526826,
      "card_id": "C07671-K2",
      "customer_id": "C07671",
      "risk_score": 0.76
    }
  },
  "HHG-014": {
    "case_id": "HHG-014",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.94,
      "pattern": "undocumented",
      "pattern_description": "Organized multi-card fraud syndicate operating through automated Samsung SM-G935F Android endpoints masked by anonymous IP proxy infrastructure across multiple cardholders.",
      "affected_txn_ids": [
        "3478561"
      ],
      "first_suspicious_txn_id": "3478561",
      "connected_card_ids": [
        "C11468-K1",
        "C11687-K1",
        "C04311-K1",
        "C09174-K1",
        "C06617-K1",
        "C06197-K1",
        "C03528-K1",
        "C07762-K1",
        "C12033-K1",
        "C12900-K1",
        "C03551-K1",
        "C12395-K1",
        "C08112-K1",
        "C03744-K1",
        "C07485-K1",
        "C09354-K1",
        "C10955-K1",
        "C01935-K1",
        "C09998-K1",
        "C12132-K1",
        "C10350-K1",
        "C12574-K1",
        "C00255-K1",
        "C09733-K1",
        "C10326-K1",
        "C08168-K1",
        "C01996-K1",
        "C09975-K1",
        "C02975-K1",
        "C01289-K1",
        "C04108-K1",
        "C10193-K1",
        "C11670-K1",
        "C02910-K1",
        "C12796-K1",
        "C04274-K1",
        "C09906-K1",
        "C09049-K1",
        "C13291-K1",
        "C06710-K1",
        "C11082-K1",
        "C03676-K1",
        "C05448-K1",
        "C06031-K1",
        "C09195-K1",
        "C10020-K1",
        "C12645-K1",
        "C11702-K1",
        "C08972-K1",
        "C07472-K1",
        "C06650-K1"
      ],
      "connected_device_profiles": [
        "SM-G935F Build/NRD90M | Android 7.0 | chrome 62.0 for android | 1920x1080"
      ],
      "exposure_usd": 74.96,
      "evidence": [
        {
          "claim": "Flagged transaction 3478561 links via device profile (SM-G935F Build/NRD90M | Android 7.0 | chrome 62.0 for android | 1920x1080) to 51 connected cards across the bank.",
          "source": "graph",
          "ref": "query:device_neighbors(device_profile)",
          "entity_ids": [
            "3478561",
            "C11468-K1",
            "C11687-K1",
            "C04311-K1",
            "C09174-K1"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-2971",
        "CC-3035"
      ],
      "summary": "Investigation confirmed undocumented on card C13487-K1 totaling $74.96 across 1 transaction(s). Linked to 51 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-014"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer states they never made these online purchases and did not authorize use of an anonymous proxy."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "R6: suspicious transaction linked to documented proxy ring"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: confirm unauthorized activity with cardholder"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $74.96)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        },
        {
          "action": "FILE_REPORT",
          "route": "L2",
          "reason": "Policy 3a: Mandatory SAR filing required under Policy 3a and activity connects to shared device profile or multi-card syndicate; activity exhibits coordinated or undocumented evasion pattern (Rule R9)."
        },
        {
          "action": "MONITOR_CONNECTED_CARDS",
          "route": "auto",
          "reason": "R6: 51 connected cards share compromised device profile"
        },
        {
          "action": "ESCALATE_TO_ANALYST",
          "route": "auto",
          "reason": "R9: novel undocumented coordinated pattern requires human analyst review"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.94. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": true,
      "reason": "Mandatory SAR filing required under Policy 3a and activity connects to shared device profile or multi-card syndicate; activity exhibits coordinated or undocumented evasion pattern (Rule R9).",
      "narrative": "Between 2016-11-22 and 2016-11-22, financial institution detection systems identified unauthorized activity on card C13487-K1, issued to customer C13487. The suspicious activity comprises 1 online transactions totaling $74.96 under merchant product classification(s) C, featuring individual transactions of $74.96. Technical telemetry indicates these transactions originated through a distinct device profile (SM-G935F Build/NRD90M | Android 7.0 | chrome 62.0 for android | 1920x1080), identified as an uncharacteristic endpoint for the primary account holder. The activity represents an organized fraud mechanism: Organized multi-card fraud syndicate operating through automated Samsung SM-G935F Android endpoints masked by anonymous IP proxy infrastructure across multiple cardholders.. Graph relationship traversal in TigerGraph revealed this fraudulent endpoint is shared across 51 additional cardholder account(s), specifically including C11468-K1, C11687-K1, C04311-K1, establishing a coordinated fraud ring. Following automated security outreach, customer states they never made these online purchases and did not authorize use of an anonymous proxy., affirming that the charges were fully unauthorized. In accordance with Bank Fraud Policy and BSA/AML regulatory requirements, card C13487-K1 was immediately blocked and queued for reissue, connected accounts were placed under heightened monitoring, and total bank exposure was contained at $74.96.",
      "subjects": [
        "C13487",
        "C13487-K1",
        "C11468-K1",
        "C11687-K1",
        "C04311-K1",
        "C09174-K1",
        "C06617-K1",
        "SM-G935F Build/NRD90M"
      ],
      "total_amount_usd": 74.96,
      "activity_dates": [
        "2016-11-22",
        "2016-11-22"
      ]
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 7406,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-22 20:11:00",
      "trigger_type": "analyst_request",
      "trigger_text": "Analyst request: several cards this month show purchases from the same unusual device profile. Review transaction 3478561 on card C13487-K1 and look for related activity.",
      "flagged_txn_id": 3478561,
      "card_id": "C13487-K1",
      "customer_id": "C13487",
      "risk_score": null
    }
  },
  "HHG-015": {
    "case_id": "HHG-015",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [
        "C11227-K1",
        "C01155-K1",
        "C02881-K1",
        "C11413-K1",
        "C00681-K1",
        "C05704-K1",
        "C05292-K1"
      ],
      "connected_device_profiles": [
        "Trident/7.0 | Windows 8.1 | ie 11.0 for desktop | 1680x1050"
      ],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3464869 fits established customer behavior: customer has 65 prior transactions with habitual billing in region 327.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3464869"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0007",
        "CC-0031"
      ],
      "summary": "Alert triggered by risk_score for $599.94 on card C03042-K1. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-015"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 4,
    "tokens": 1574,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-17 19:03:36",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3464869 ($599.94, online) at 0.77. Review and decide.",
      "flagged_txn_id": 3464869,
      "card_id": "C03042-K1",
      "customer_id": "C03042",
      "risk_score": 0.77
    }
  },
  "HHG-016": {
    "case_id": "HHG-016",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.89,
      "pattern": "card_not_present_new_device",
      "pattern_description": "",
      "affected_txn_ids": [
        "3534820"
      ],
      "first_suspicious_txn_id": "3534820",
      "connected_card_ids": [],
      "connected_device_profiles": [
        "Windows |  | edge 16.0 |"
      ],
      "exposure_usd": 59.67,
      "evidence": [
        {
          "claim": "Customer explicitly reported transaction 3534820 ($59.67) as unauthorized.",
          "source": "customer",
          "ref": "customer_message:report",
          "entity_ids": [
            "3534820"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0071",
        "CC-0110"
      ],
      "summary": "Investigation confirmed card not present new device on card C09988-K1 totaling $59.67 across 1 transaction(s). Linked to 0 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-016"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed in their report that they did not authorize the charge and remain in possession of the card."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $59.67)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.89. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 1638,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-12 01:39:08",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C09988 message: 'I never made this $59.67 purchase. Please check my card.' Refers to 3534820.",
      "flagged_txn_id": 3534820,
      "card_id": "C09988-K1",
      "customer_id": "C09988",
      "risk_score": null
    }
  },
  "HHG-017": {
    "case_id": "HHG-017",
    "case": {
      "status": "closed_fraud",
      "verdict": "fraud",
      "fraud_probability": 0.88,
      "pattern": "card_not_present_fraud",
      "pattern_description": "",
      "affected_txn_ids": [
        "3450436",
        "3450503",
        "3450629"
      ],
      "first_suspicious_txn_id": "3450436",
      "connected_card_ids": [
        "C11965-K1",
        "C08662-K1",
        "C10222-K1",
        "C11539-K1",
        "C12598-K1",
        "C05560-K1",
        "C05704-K1",
        "C07212-K1",
        "C07867-K1",
        "C12682-K1",
        "C04410-K1",
        "C06224-K1",
        "C07076-K1",
        "C00750-K1",
        "C11000-K1",
        "C04230-K1",
        "C02180-K1",
        "C11204-K1",
        "C08528-K1",
        "C02231-K1",
        "C09666-K1",
        "C04016-K1",
        "C09956-K1",
        "C11496-K1",
        "C09283-K1",
        "C02897-K1",
        "C12593-K1",
        "C13007-K1",
        "C07858-K1",
        "C07862-K1",
        "C08793-K1",
        "C02342-K1",
        "C02079-K1",
        "C07757-K1",
        "C02975-K1",
        "C11190-K1",
        "C01757-K1",
        "C07194-K1",
        "C12797-K1",
        "C10930-K1",
        "C06330-K1",
        "C03040-K1",
        "C06220-K1",
        "C02942-K1",
        "C09683-K1",
        "C04865-K1",
        "C03738-K1",
        "C00685-K1",
        "C08412-K1",
        "C01162-K1",
        "C09873-K1",
        "C08972-K1",
        "C09471-K1",
        "C12166-K1",
        "C02716-K1",
        "C13328-K1",
        "C06026-K1",
        "C11792-K1",
        "C03412-K1",
        "C09443-K1",
        "C07741-K1",
        "C07466-K1",
        "C06835-K1",
        "C07871-K1",
        "C01104-K1",
        "C04576-K1",
        "C07096-K1",
        "C05292-K1",
        "C04125-K1",
        "C06250-K1",
        "C04316-K1",
        "C00694-K1",
        "C01489-K1",
        "C03839-K1",
        "C01154-K1",
        "C09149-K1",
        "C04759-K1",
        "C11143-K1",
        "C09719-K1",
        "C07669-K1",
        "C07987-K1",
        "C12592-K1",
        "C08360-K1",
        "C01155-K1",
        "C07847-K1",
        "C06279-K1",
        "C04134-K1",
        "C00854-K1",
        "C09132-K1",
        "C10675-K1",
        "C04117-K1",
        "C12460-K1",
        "C05791-K1",
        "C11198-K1",
        "C05327-K1",
        "C12897-K1",
        "C03146-K1",
        "C12211-K1",
        "C03778-K1",
        "C00645-K1",
        "C00329-K1",
        "C05360-K1",
        "C04077-K1",
        "C03533-K1",
        "C13370-K1",
        "C04327-K1",
        "C07078-K1",
        "C09241-K1",
        "C07518-K1",
        "C05852-K1",
        "C00600-K1",
        "C06588-K1",
        "C02354-K1",
        "C07594-K1",
        "C11786-K1",
        "C05245-K1",
        "C06947-K1",
        "C10320-K1",
        "C01239-K1",
        "C04798-K1",
        "C04046-K1",
        "C07069-K1",
        "C03575-K1",
        "C01952-K1",
        "C11709-K1",
        "C06208-K1",
        "C08989-K1",
        "C07612-K1",
        "C08605-K1",
        "C11227-K1",
        "C13148-K1",
        "C09589-K1",
        "C11543-K1",
        "C10366-K1",
        "C03684-K1",
        "C06669-K1",
        "C07735-K1",
        "C07033-K1",
        "C13440-K1",
        "C04776-K1",
        "C07989-K1",
        "C09470-K1",
        "C07474-K1",
        "C08922-K1",
        "C00960-K1",
        "C06104-K1",
        "C08918-K1",
        "C01909-K1",
        "C11464-K1",
        "C09249-K1",
        "C03019-K1",
        "C05086-K1",
        "C09165-K1",
        "C09981-K1",
        "C08083-K1",
        "C01387-K1",
        "C12993-K1",
        "C09933-K1",
        "C05992-K1",
        "C10068-K1",
        "C07718-K1",
        "C03999-K1",
        "C05868-K1",
        "C08450-K1",
        "C04965-K1",
        "C04108-K1",
        "C12267-K1",
        "C06514-K1",
        "C12136-K1",
        "C09854-K1",
        "C00952-K1",
        "C08363-K1",
        "C12983-K1",
        "C03043-K1",
        "C05079-K1",
        "C09804-K1",
        "C11159-K1",
        "C10553-K1",
        "C10640-K1",
        "C03218-K1",
        "C08737-K1",
        "C09347-K1",
        "C03351-K1",
        "C09565-K1",
        "C10245-K1",
        "C01109-K1",
        "C07207-K1",
        "C01961-K1",
        "C02483-K1",
        "C03318-K1",
        "C09274-K1",
        "C03405-K1",
        "C03848-K1",
        "C11833-K1",
        "C13260-K1",
        "C11929-K1",
        "C11309-K1",
        "C08531-K1",
        "C13180-K1",
        "C07997-K1",
        "C11005-K1",
        "C04627-K1",
        "C05809-K1",
        "C07311-K1",
        "C06948-K1",
        "C05078-K1",
        "C09684-K1",
        "C02214-K1",
        "C13015-K1",
        "C11385-K1",
        "C01367-K1",
        "C00712-K1",
        "C12586-K1",
        "C10757-K1",
        "C10755-K1",
        "C01040-K1",
        "C11076-K1",
        "C12389-K1",
        "C04796-K1",
        "C01744-K1",
        "C05426-K1",
        "C05876-K1",
        "C10955-K1",
        "C10472-K1",
        "C12552-K1",
        "C09586-K1",
        "C02562-K1",
        "C04024-K1",
        "C03885-K1",
        "C05690-K1",
        "C05186-K1",
        "C08658-K1",
        "C09405-K1",
        "C12818-K1",
        "C01983-K1",
        "C09654-K1",
        "C10098-K1",
        "C10295-K1",
        "C08703-K1",
        "C00219-K1",
        "C10264-K1",
        "C06303-K1",
        "C06375-K1",
        "C11413-K1",
        "C05554-K1",
        "C09664-K1",
        "C02469-K1",
        "C01780-K1",
        "C04949-K1",
        "C07162-K1",
        "C03175-K1",
        "C04754-K1",
        "C00180-K1",
        "C13333-K1",
        "C09788-K1",
        "C09463-K1",
        "C00163-K1",
        "C11997-K1",
        "C03096-K1",
        "C03278-K1",
        "C13063-K1",
        "C03838-K1",
        "C00235-K1",
        "C06605-K1",
        "C06343-K1",
        "C09899-K1",
        "C00820-K1",
        "C05886-K1",
        "C02463-K1",
        "C07187-K1",
        "C09600-K1",
        "C08945-K1",
        "C10026-K1",
        "C08748-K1",
        "C00595-K1",
        "C04571-K1",
        "C08376-K1",
        "C11666-K1",
        "C04596-K1",
        "C04928-K1",
        "C10751-K1",
        "C02830-K1",
        "C07356-K1",
        "C09800-K1",
        "C01755-K1",
        "C12042-K1",
        "C09017-K1",
        "C10177-K1",
        "C08008-K1",
        "C09468-K1",
        "C01569-K1",
        "C03598-K1",
        "C06167-K1",
        "C09195-K1",
        "C10127-K1",
        "C05108-K1",
        "C06482-K1",
        "C05530-K1"
      ],
      "connected_device_profiles": [
        "Windows | Windows 10 | chrome 65.0 | 1920x1080"
      ],
      "exposure_usd": 300.14,
      "evidence": [
        {
          "claim": "Rapid repeated authorizations of $100.09 routed through hidden proxy (IP_PROXY:HIDDEN) on an uncharacteristic channel.",
          "source": "graph",
          "ref": "query:card_window(card_id, hours=1)",
          "entity_ids": [
            "3450436",
            "3450503",
            "3450629"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0049",
        "CC-0089"
      ],
      "summary": "Investigation confirmed card not present fraud on card C04570-K1 totaling $300.14 across 3 transaction(s). Linked to 298 connected cards. Blocked card under Rule R2 and updated graph case memory.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-017"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer states they did not make these online purchases and never used a hidden proxy service."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: single risk score under 0.70; verify with cardholder before blocking"
        },
        {
          "action": "MONITOR_CARD",
          "route": "auto",
          "reason": "Raise monitoring sensitivity pending customer response"
        }
      ],
      "final": [
        {
          "action": "BLOCK_CARD",
          "route": "L1",
          "reason": "R2: customer denied transaction; block and reissue card (exposure $300.14)"
        },
        {
          "action": "CREATE_CASE",
          "route": "auto",
          "reason": "R2: open internal fraud case with full evidence attached and write to graph"
        },
        {
          "action": "FILE_REPORT",
          "route": "L2",
          "reason": "Policy 3a: Mandatory SAR filing required under Policy 3a and activity connects to shared device profile or multi-card syndicate."
        },
        {
          "action": "MONITOR_CONNECTED_CARDS",
          "route": "auto",
          "reason": "R6: 298 connected cards share compromised device profile"
        }
      ],
      "what_changed": "Customer denial confirmed fraudulent activity, escalating fraud probability to 0.88. Actions advanced from customer verification to card block (route L1), internal case creation, and regulatory filing."
    },
    "sar": {
      "file": true,
      "reason": "Mandatory SAR filing required under Policy 3a and activity connects to shared device profile or multi-card syndicate.",
      "narrative": "Between 2016-11-11 and 2016-11-11, financial institution detection systems identified unauthorized activity on card C04570-K1, issued to customer C04570. The suspicious activity comprises 3 online transactions totaling $300.14 under merchant product classification(s) R, featuring individual transactions of $100.09, $99.96, $100.09. Technical telemetry indicates these transactions originated through a distinct device profile (Windows | Windows 10 | chrome 65.0 | 1920x1080), identified as an uncharacteristic endpoint for the primary account holder. The velocity, amount distribution, and channel routing of the authorizations deviate markedly from documented cardholder history without legitimate commercial justification. Graph relationship traversal in TigerGraph revealed this fraudulent endpoint is shared across 298 additional cardholder account(s), specifically including C11965-K1, C08662-K1, C10222-K1, establishing a coordinated fraud ring. Following automated security outreach, customer states they did not make these online purchases and never used a hidden proxy service., affirming that the charges were fully unauthorized. In accordance with Bank Fraud Policy and BSA/AML regulatory requirements, card C04570-K1 was immediately blocked and queued for reissue, connected accounts were placed under heightened monitoring, and total bank exposure was contained at $300.14.",
      "subjects": [
        "C04570",
        "C04570-K1",
        "C11965-K1",
        "C08662-K1",
        "C10222-K1",
        "C11539-K1",
        "C12598-K1",
        "Windows"
      ],
      "total_amount_usd": 300.14,
      "activity_dates": [
        "2016-11-11",
        "2016-11-11"
      ]
    },
    "stop_reason": "Customer denial confirmed compromise and graph analysis determined complete exposure. Precedent cited and defensible actions taken.",
    "tool_calls": 4,
    "tokens": 7182,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-12 00:46:24",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3450629 ($100.09, online) at 0.57. Review and decide.",
      "flagged_txn_id": 3450629,
      "card_id": "C04570-K1",
      "customer_id": "C04570",
      "risk_score": 0.57
    }
  },
  "HHG-018": {
    "case_id": "HHG-018",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [],
      "connected_device_profiles": [],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3491361 fits established customer behavior: customer has 5772 prior transactions with habitual billing in region 126.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3491361"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0003",
        "CC-0009"
      ],
      "summary": "Alert triggered by customer_report for $39.08 on card C02354-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-018"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "DECLINE_TRANSACTION",
          "route": "L1",
          "reason": "Customer reported unrecognized charge; decline further authorizations"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: gather formal dispute verification"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 3,
    "tokens": 1590,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-11-27 14:41:26",
      "trigger_type": "customer_report",
      "trigger_text": "Customer C02354 message: 'I never made this $39.08 purchase. Please check my card.' Refers to 3491361.",
      "flagged_txn_id": 3491361,
      "card_id": "C02354-K2",
      "customer_id": "C02354",
      "risk_score": null
    }
  },
  "HHG-019": {
    "case_id": "HHG-019",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [
        "C11309-K1",
        "C07987-K1",
        "C06224-K1",
        "C01983-K1",
        "C01104-K1"
      ],
      "connected_device_profiles": [
        "Windows | other | chrome 61.0 | 1280x720"
      ],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3503878 fits established customer behavior: customer has 219 prior transactions with habitual billing in region 264.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3503878"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0014",
        "CC-0022"
      ],
      "summary": "Alert triggered by risk_score for $99.92 on card C07987-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-019"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "STEP_UP_AUTH",
          "route": "auto",
          "reason": "R1: require step-up authentication on ambiguous high-score transaction"
        },
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: verify with customer"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 4,
    "tokens": 1570,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-01 22:28:53",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3503878 ($99.92, online) at 0.90. Review and decide.",
      "flagged_txn_id": 3503878,
      "card_id": "C07987-K2",
      "customer_id": "C07987",
      "risk_score": 0.9
    }
  },
  "HHG-020": {
    "case_id": "HHG-020",
    "case": {
      "status": "closed_legitimate",
      "verdict": "legitimate",
      "fraud_probability": 0.05,
      "pattern": "none",
      "pattern_description": "",
      "affected_txn_ids": [],
      "first_suspicious_txn_id": "",
      "connected_card_ids": [
        "C11000-K1",
        "C11539-K1",
        "C04108-K1",
        "C05362-K1",
        "C11031-K1",
        "C09420-K1",
        "C08395-K1",
        "C05560-K1",
        "C09800-K1",
        "C08978-K1",
        "C12115-K1",
        "C13070-K1",
        "C05973-K1",
        "C10971-K1",
        "C00750-K1",
        "C04661-K1",
        "C02999-K1",
        "C06708-K1",
        "C07871-K1",
        "C08484-K1",
        "C08687-K1",
        "C10590-K1",
        "C03040-K1",
        "C06605-K1",
        "C01877-K1",
        "C11332-K1",
        "C09274-K1",
        "C08374-K1",
        "C12865-K1",
        "C03992-K1",
        "C02094-K1",
        "C00895-K1",
        "C01155-K1",
        "C08134-K1",
        "C06210-K1",
        "C00854-K1",
        "C05115-K1",
        "C10553-K1",
        "C09249-K1",
        "C07925-K1",
        "C06841-K1",
        "C08686-K1",
        "C10967-K1",
        "C05453-K1",
        "C04125-K1",
        "C02740-K1",
        "C09165-K1",
        "C10614-K1",
        "C02354-K1",
        "C08746-K1",
        "C07212-K1",
        "C09863-K1",
        "C06224-K1",
        "C03066-K1",
        "C01154-K1",
        "C04060-K1",
        "C05704-K1",
        "C12150-K1",
        "C06958-K1",
        "C04866-K1",
        "C12961-K1",
        "C04339-K1",
        "C02079-K1",
        "C11362-K1",
        "C12060-K1",
        "C01918-K1",
        "C10955-K1",
        "C09006-K1",
        "C00849-K1",
        "C04348-K1",
        "C09527-K1",
        "C10588-K1",
        "C01116-K1",
        "C05782-K1",
        "C01109-K1",
        "C04759-K1",
        "C07457-K1",
        "C06682-K1",
        "C11227-K1",
        "C00773-K1",
        "C09827-K1",
        "C02897-K1",
        "C08489-K1",
        "C12094-K1",
        "C03341-K1",
        "C09358-K1",
        "C06835-K1",
        "C07149-K1",
        "C02716-K1",
        "C03474-K1",
        "C05759-K1",
        "C05622-K1",
        "C00796-K1",
        "C03784-K1",
        "C07196-K1",
        "C08653-K1",
        "C13440-K1",
        "C02923-K1",
        "C04225-K1",
        "C01721-K1",
        "C02231-K1",
        "C00768-K1",
        "C08635-K1",
        "C01138-K1",
        "C08256-K1",
        "C11945-K1",
        "C07062-K1",
        "C05868-K1",
        "C07311-K1",
        "C06962-K1",
        "C07975-K1",
        "C04848-K1",
        "C00942-K1",
        "C11010-K1",
        "C11522-K1",
        "C11496-K1",
        "C04150-K1",
        "C09719-K1",
        "C12690-K1",
        "C00375-K1",
        "C04544-K1",
        "C00094-K1",
        "C04965-K1",
        "C02084-K1",
        "C10559-K1",
        "C13072-K1",
        "C08153-K1",
        "C07260-K1",
        "C07654-K1",
        "C08383-K1",
        "C10751-K1",
        "C06657-K1",
        "C05245-K1",
        "C07162-K1",
        "C08232-K1",
        "C04557-K1",
        "C03533-K1",
        "C11293-K1",
        "C08748-K1",
        "C01864-K1",
        "C10320-K1",
        "C03278-K1",
        "C03575-K1",
        "C02440-K1",
        "C09443-K1",
        "C01755-K1",
        "C08707-K1",
        "C11385-K1",
        "C08917-K1",
        "C08742-K1",
        "C06125-K1",
        "C13550-K1",
        "C13370-K1",
        "C10874-K1",
        "C05447-K1",
        "C11143-K1",
        "C08363-K1",
        "C05141-K1",
        "C02582-K1",
        "C10855-K1",
        "C10295-K1",
        "C09337-K1",
        "C04968-K1",
        "C09843-K1",
        "C08943-K1",
        "C10307-K1",
        "C12621-K1",
        "C01856-K1",
        "C13328-K1",
        "C02335-K1",
        "C12897-K1",
        "C09405-K1",
        "C06891-K1",
        "C07102-K1",
        "C11309-K1",
        "C03316-K1",
        "C04537-K1",
        "C03467-K1",
        "C00328-K1",
        "C10037-K1",
        "C03885-K1",
        "C11044-K1",
        "C11533-K1",
        "C11709-K1",
        "C09024-K1",
        "C00818-K1",
        "C12360-K1",
        "C12305-K1",
        "C07518-K1",
        "C09270-K1",
        "C04181-K1",
        "C04764-K1",
        "C03019-K1",
        "C09206-K1",
        "C02902-K1",
        "C06320-K1",
        "C07730-K1",
        "C11159-K1",
        "C03271-K1",
        "C08913-K1",
        "C08605-K1",
        "C05039-K1",
        "C10897-K1",
        "C04187-K1",
        "C02667-K1",
        "C12739-K1",
        "C03080-K1",
        "C02393-K1",
        "C09185-K1",
        "C03169-K1",
        "C02966-K1",
        "C08679-K1",
        "C03089-K1",
        "C09436-K1",
        "C13153-K1",
        "C03484-K1",
        "C03218-K1",
        "C09612-K1",
        "C12585-K1",
        "C09301-K1",
        "C01419-K1",
        "C11637-K1",
        "C12166-K1",
        "C00989-K1",
        "C03182-K1",
        "C07612-K1",
        "C06220-K1",
        "C02171-K1",
        "C10390-K1",
        "C07969-K1",
        "C05546-K1",
        "C12265-K1",
        "C04565-K1",
        "C03279-K1",
        "C02254-K1",
        "C00704-K1",
        "C03843-K1",
        "C01377-K1",
        "C06348-K1",
        "C11294-K1",
        "C03070-K1",
        "C05797-K1",
        "C07133-K1",
        "C03285-K1",
        "C08072-K1",
        "C09159-K1",
        "C07323-K1",
        "C02554-K1",
        "C02910-K1",
        "C01033-K1",
        "C02479-K1",
        "C04865-K1",
        "C06208-K1"
      ],
      "connected_device_profiles": [
        "Trident/7.0 | Windows 10 | ie 11.0 for desktop | 1920x1080"
      ],
      "exposure_usd": 0.0,
      "evidence": [
        {
          "claim": "Transaction 3509359 fits established customer behavior: customer has 83 prior transactions with habitual billing in region 264.0.",
          "source": "graph",
          "ref": "query:customer_history(customer_id)",
          "entity_ids": [
            "3509359"
          ]
        }
      ],
      "similar_prior_cases": [
        "CC-0007",
        "CC-0031"
      ],
      "summary": "Alert triggered by risk_score for $125.08 on card C12265-K2. Graph analysis and customer verification confirmed legitimate routine authorization. Closed as legitimate under Rule R3.",
      "written_to_graph": true,
      "graph_case_id": "CASE-TG-HHG-020"
    },
    "evidence_requests": [
      {
        "type": "customer_validation",
        "asked_after_step": 2,
        "assumed_response": "Customer confirmed they authorized the transaction during normal routine spending."
      }
    ],
    "next_best_actions": {
      "initial": [
        {
          "action": "VERIFY_WITH_CUSTOMER",
          "route": "auto",
          "reason": "R1: single risk score under 0.70; verify with cardholder before blocking"
        },
        {
          "action": "MONITOR_CARD",
          "route": "auto",
          "reason": "Raise monitoring sensitivity pending customer response"
        }
      ],
      "final": [
        {
          "action": "CLOSE_NO_FRAUD",
          "route": "auto",
          "reason": "R3: customer confirmed the transaction; alert resolved as legitimate"
        }
      ],
      "what_changed": "Customer confirmed transaction authorization; initial verification alert cleared with no fraud detected under Rule R3."
    },
    "sar": {
      "file": false,
      "reason": "Legitimate activity confirmed; no report required under policy.",
      "narrative": "",
      "subjects": [],
      "total_amount_usd": 0.0,
      "activity_dates": []
    },
    "stop_reason": "Customer confirmation settled the inquiry; historical baseline confirms legitimate spending. Investigation completed.",
    "tool_calls": 4,
    "tokens": 1574,
    "latency_s": 0.01,
    "pack_meta": {
      "opened_at": "2016-12-03 12:04:26",
      "trigger_type": "risk_score",
      "trigger_text": "Real-time model scored transaction 3509359 ($125.08, online) at 0.52. Review and decide.",
      "flagged_txn_id": 3509359,
      "card_id": "C12265-K2",
      "customer_id": "C12265",
      "risk_score": 0.52
    }
  }
};