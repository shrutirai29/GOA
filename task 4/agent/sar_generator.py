"""
FinCEN Suspicious Activity Report (SAR) Narrative Synthesizer
Generates standalone 6-12 sentence regulatory filings answering Who, What, When, Where, How, Why.
"""

from typing import List, Dict, Any

class SARNarrativeGenerator:
    @staticmethod
    def generate(case_id: str, customer_id: str, card_id: str, 
                 pattern: str, pattern_desc: str,
                 affected_txns: List[Dict[str, Any]], 
                 connected_cards: List[str], 
                 connected_devices: List[str],
                 assumed_customer_response: str,
                 exposure_usd: float,
                 activity_dates: List[str]) -> str:
        """
        Synthesizes an exhaustive, regulatory-grade SAR narrative.
        """
        start_date = activity_dates[0] if activity_dates else "2016-11-01"
        end_date = activity_dates[1] if len(activity_dates) > 1 else start_date
        
        # Details of affected transactions
        n_txns = len(affected_txns)
        amounts = [f"${t['TransactionAmt']:.2f}" for t in affected_txns[:4]]
        amt_summary = ", ".join(amounts)
        if n_txns > 4:
            amt_summary += f", and {n_txns - 4} additional authorizations"

        # Channel & Product summary
        channels = list(set([t.get('channel', 'online') for t in affected_txns]))
        channel_str = " and ".join(channels)
        products = list(set([str(t.get('ProductCD', 'W')) for t in affected_txns]))
        product_str = ", ".join(products)

        # Device info
        dev_str = connected_devices[0] if connected_devices else "unregistered remote endpoint"
        
        sentences = []
        
        # 1. Who & When
        sentences.append(
            f"Between {start_date} and {end_date}, financial institution detection systems identified unauthorized activity on card {card_id}, issued to customer {customer_id}."
        )

        # 2. What & Amounts
        sentences.append(
            f"The suspicious activity comprises {n_txns} {channel_str} transactions totaling ${exposure_usd:,.2f} under merchant product classification(s) {product_str}, featuring individual transactions of {amt_summary}."
        )

        # 3. Where & Channel Details
        if "online" in channels and dev_str != "unregistered remote endpoint":
            sentences.append(
                f"Technical telemetry indicates these transactions originated through a distinct device profile ({dev_str}), identified as an uncharacteristic endpoint for the primary account holder."
            )
        else:
            regions = list(set([str(t.get('addr1')) for t in affected_txns if t.get('addr1') is not None]))
            reg_str = ", ".join(regions) if regions else "unspecified regions"
            sentences.append(
                f"The physical transactions were processed through card-present merchant terminals across billing region code(s) {reg_str}, deviating from the customer's established transactional footprint."
            )

        # 4. How & Pattern Typology
        if pattern == "card_testing":
            sentences.append(
                "The velocity and sizing of the initial micro-authorizations followed by rapid substantial purchases reflect textbook card testing behavior consistent with FinCEN guidance on cyber-enabled payment fraud."
            )
        elif pattern == "account_takeover":
            sentences.append(
                "The concurrent disruption of behavioral baselines, mixed-channel attempts, and modified connection attributes indicates account takeover via compromised cardholder credentials."
            )
        elif pattern == "card_not_present_new_device":
            sentences.append(
                "The card number was utilized online from a previously unseen device profile without customer authentication, characteristic of card-not-present fraud following card data exfiltration."
            )
        elif pattern == "out_of_region_use":
            sentences.append(
                "Counterfeit card cloning is indicated by simultaneous card-present charges in conflicting geographic billing zones while the legitimate customer continued local domestic usage."
            )
        elif pattern == "undocumented":
            sentences.append(
                f"The activity represents an organized fraud mechanism: {pattern_desc}."
            )
        else:
            sentences.append(
                "The velocity, amount distribution, and channel routing of the authorizations deviate markedly from documented cardholder history without legitimate commercial justification."
            )

        # 5. Connected Network / Syndicate
        if connected_cards:
            conn_sample = ", ".join(connected_cards[:3])
            sentences.append(
                f"Graph relationship traversal in TigerGraph revealed this fraudulent endpoint is shared across {len(connected_cards)} additional cardholder account(s), specifically including {conn_sample}, establishing a coordinated fraud ring."
            )

        # 6. Customer Contact & Why Suspicious
        if assumed_customer_response:
            sentences.append(
                f"Following automated security outreach, {assumed_customer_response.lower()}, affirming that the charges were fully unauthorized."
            )

        # 7. Remediation / Conclusion
        sentences.append(
            f"In accordance with Bank Fraud Policy and BSA/AML regulatory requirements, card {card_id} was immediately blocked and queued for reissue, connected accounts were placed under heightened monitoring, and total bank exposure was contained at ${exposure_usd:,.2f}."
        )

        return " ".join(sentences)
