require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRETKEY);
var braintree = require("braintree");

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   process.env.BRAINTREE_MERCHANTID,
    publicKey:    process.env.BRAINTREE_PUBLICKEY,
    privateKey:   process.env.BRAINTREE_PRIVATEKEY
});

var express = require('express');
var router = express.Router();

// BRAINTREE
router.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

router.post("/braintree-checkout", function (req, res) {
    // var nonceFromTheClient = req.body.payment_method_nonce;
    // Use payment method nonce here
    console.log("nonce received");

    var saleRequest = {
        amount: req.body.amount,
        customFields: {
            itemname: req.body.itemName,
            itemquantity: req.body.itemQuantity,
            itemurl: req.body.itemUrl
        },
        paymentMethodNonce: req.body.nonce,
        options: {
          paypal: {
            customField: `${req.body.itemQuantity} ${req.body.itemName} to ${req.body.itemUrl}`,
            description: `${req.body.itemQuantity} ${req.body.itemName} to ${req.body.itemUrl}`,
          },
          submitForSettlement: true
        }
      };

      gateway.transaction.sale(saleRequest, function (err, result) {
        if (err) {
          res.json({status: "error", error: err, result: result});
          console.log(err);
        } else if (result.success) {
          res.json({status: "success"});
        //   res.send("<h1>Success! Transaction ID: " + result.transaction.id + "</h1>");
          console.log(result.transaction.id);
        } else {
        //   res.send("<h1>Error:  " + result.message + "</h1>");
          res.json({status: "error", error: err, result: result});
          console.log(result.message);
        }
      });

  });

router.get("/charge", (req, res) =>
res.render("charge"));


// STRIPE
/* POST route to receive purchase form data and create charge request. */
router.post("/charge", (req, res) => {

    console.log(req.body);

    // bitcoin payment
    if (req.body.object === "source") {
        stripe.charges.create({
            amount: req.body.PAYAMOUNT,
            currency: "usd",
            description: `${req.body.PAYQUANTITY} ${req.body.PAYITEM} to ${req.body.PAYURL}`,
            metadata: {
                item: req.body.PAYITEM,
                quantity: req.body.PAYQUANTITY,
                url: req.body.PAYURL
            },
            source: req.body.id
        })
        .then(charge => res.render("charge"));
    }

    // card payment
    if (req.body.object === "token") {

        //  one time charge
        if (req.body.PAYINTERVAL === "onetime") {

            stripe.customers.create({
                email: req.body.email,
                card: req.body.id
            })
            .then(customer =>
                stripe.charges.create({
                    amount: req.body.PAYAMOUNT,
                    description: `${req.body.PAYQUANTITY} ${req.body.PAYITEM} to ${req.body.PAYURL}`,
                    metadata: {
                        item: req.body.PAYITEM,
                        quantity: req.body.PAYQUANTITY,
                        url: req.body.PAYURL
                    },
                    currency: "usd",
                    customer: customer.id
                }))
            .then(charge => res.render("charge"));
        }

        // recurring payment
        if (req.body.PAYINTERVAL === "monthly") {

            var planId = `${req.body.PAYQUANTITY} ${req.body.PAYITEM}`.replace(/\s/g, "-");

            // check if plan exist
            stripe.plans.retrieve(
                planId,
                function(err, plan) {
                    if(err) {
                        // asynchronously called
                        if(err.message === `No such plan: ${planId}`){
                            // create new plan
                            // step 1: define a plan
                            stripe.plans.create({
                                name: `${req.body.PAYQUANTITY} ${req.body.PAYITEM}`,
                                id: planId, // change it to unique
                                interval: "month",
                                currency: "usd",
                                amount: req.body.PAYAMOUNT * 0.9,
                            })
                            // step 2: create a customer
                            .then(plan =>
                                stripe.customers.create({
                                    email: req.body.email,
                                    card: req.body.id
                                }))
                            // step 3: subscribe the customer to the plan
                            .then(customer =>
                                stripe.subscriptions.create({
                                    customer: customer.id,
                                    items: [
                                        {
                                            plan: planId,
                                        },
                                    ],
                                    metadata: {
                                        item: req.body.PAYITEM,
                                        quantity: req.body.PAYQUANTITY,
                                        url: req.body.PAYURL
                                    },
                                }))
                            .then(charge => res.render("charge"));
                        }
                    } else {
                        // plan already exists, subscribe the customer
                        // step 2: create a customer
                        stripe.customers.create({
                            email: req.body.email,
                            card: req.body.id
                        })
                        // step 3: subscribe the customer to the plan
                        .then(customer =>
                            stripe.subscriptions.create({
                                customer: customer.id,
                                items: [
                                    {
                                        plan: planId,
                                    },
                                ],
                                metadata: {
                                    item: req.body.PAYITEM,
                                    quantity: req.body.PAYQUANTITY,
                                    url: req.body.PAYURL
                                },
                            }
                        ))
                        .then(charge => res.render("charge"));
                    }
                }
            )
        }
    }
});

/* POST route to receive webhooks from Stripe to finalize charge. */
router.post("/webhook", function (request, response) {

    response.json({isPaid: true});
    // Retrieve the request's body and parse it as JSON
    var event_json = request.body;
    console.log(event_json);
    // Do something with event_json
    if (event_json.type === "source.chargeable") {

        // stripe.charges.create({
        //     amount: event_json.data.object.amount,
        //     currency: event_json.data.object.currency,
        //     description: event_json.data.object.PAYDESCRIPTION,
        //     source: event_json.data.object.id,
        //     metadata: {
        //         description: event_json.data.object.PAYDESCRIPTION,
        //     },
        // }, function (err, charge) {
        //     // asynchronously called
        //     if (err) {
        //         console.log(`${err.type} - ${err.message}`);
        //     }
        //     // res.render("charge");
        // });

    }

});

module.exports = router;