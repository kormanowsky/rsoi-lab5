import { EntityClient } from "@rsoi-lab2/library";
import { Payment, PaymentFilter, PaymentId } from "../../../payment/src/logic";

export class PaymentsClient extends EntityClient<Payment, PaymentFilter, PaymentId>{}