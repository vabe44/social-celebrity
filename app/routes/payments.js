require('dotenv').config()
var models      = require("../models");
var middlewares = require("../middlewares");

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
var Promise = require("bluebird");

// BRAINTREE
router.get("/client_token", function (req, res) {
    gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
    });
});

router.post("/braintree-checkout", function (req, res) {
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
router.post("/charge", middlewares.asyncMiddleware(async (req, res, next) => {

    // bitcoin payment
    if (req.body.object === "source") {
        const charge = await stripe.charges.create({
            amount: req.body.PAYAMOUNT,
            currency: "usd",
            description: `${req.body.PAYQUANTITY} ${req.body.PAYITEM} to ${req.body.PAYURL}`,
            metadata: {
                item: req.body.PAYITEM,
                quantity: req.body.PAYQUANTITY,
                url: req.body.PAYURL
            },
            source: req.body.id
        });
        res.json({status: charge.status});
    }

    // card payment
    if (req.body.object === "token") {

        //  one time charge
        if (req.body.PAYINTERVAL === "onetime") {

            const customer = await stripe.customers.create({
                email: req.body.email,
                card: req.body.id
            });

            const charge = await stripe.charges.create({
                amount: req.body.PAYAMOUNT,
                description: `${req.body.PAYQUANTITY} ${req.body.PAYITEM} to ${req.body.PAYURL}`,
                metadata: {
                    item: req.body.PAYITEM,
                    quantity: req.body.PAYQUANTITY,
                    url: req.body.PAYURL
                },
                currency: "usd",
                customer: customer.id
            });
            res.json({status: charge.status});
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
                            .then(subscription => {
                                res.json({status: subscription.status});
                            });
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
                        .then(subscription => {
                            res.json({status: subscription.status});
                        });
                    }
                }
            )
        }
    }
}));

/* POST route to receive webhooks from Stripe to finalize charge. */
router.post("/webhook", function (request, response) {

    response.sendStatus(200);
    // Retrieve the request's body and parse it as JSON
    var event_json = request.body;
    console.log(event_json);
    // Do something with event_json

});

/* POST route to buy shoutouts. */
router.post("/shoutouts", function (req, res, next) {

    Promise.join(

        models.Shoutout.findOne({ where: { id: req.body.shoutoutId }, include: [{ all: true, nested: true }] }),
        models.ShoutoutPrice.findOne({
            where: {
                shoutout_id: req.body.shoutoutId,
                shoutout_price_option_id: req.body.priceOptionId
            },
            include: [{ all: true, nested: true }]
        }),

        function(shoutout, shoutoutPrice) {

            // bitcoin payment
            if (req.body.object === "source") {
                return stripe.charges.create({
                    amount: shoutoutPrice.price * 100,
                    currency: "usd",
                    source: req.body.id,
                    destination: {
                        amount: shoutoutPrice.price * 80,
                        account: shoutout.User.stripe_user_id
                    },
                    description: `Shoutout from @${shoutout.TwitterAccount.username}`,
                    metadata: {
                        seller: shoutout.User.username,
                        account: shoutout.TwitterAccount.username,
                        caption: req.body.shoutoutCaption,
                        mediaLink: req.body.shoutoutMediaLink,
                        publishTime: req.body.shoutoutPublishTime
                    },
                })
                .then(charge => {
                    return models.ShoutoutOrder
                    .create({
                        user_id: req.body.userId,
                        shoutout_id: req.body.shoutoutId,
                        stripe_tx_id: charge.id,
                        caption: req.body.shoutoutCaption,
                        media_link: req.body.shoutoutMediaLink,
                        publish_time: req.body.shoutoutPublishTime,
                        price_option: req.body.priceOptionName,
                        price: shoutoutPrice.price
                    });
                })
                .then(charge => {
                    res.json(charge);
                })
                .catch(error => {
                    console.log("Oops, something went wrong. " + error);
                });
            }

            // card payment
            if (req.body.object === "token") {
                stripe.customers.create({
                    email: req.body.email,
                    card: req.body.id
                })
                .then(customer => {
                    return stripe.charges.create({
                        amount: shoutoutPrice.price * 100,
                        currency: "usd",
                        customer: customer.id,
                        destination: {
                            amount: shoutoutPrice.price * 80,
                            account: shoutout.User.stripe_user_id
                        },
                        description: `Shoutout from @${shoutout.TwitterAccount.username}`,
                        metadata: {
                            seller: shoutout.User.username,
                            account: shoutout.TwitterAccount.username,
                            caption: req.body.shoutoutCaption,
                            mediaLink: req.body.shoutoutMediaLink,
                            publishTime: req.body.shoutoutPublishTime
                        },
                    });
                })
                .then(charge => {
                    return models.ShoutoutOrder
                    .create({
                        user_id: req.body.userId,
                        shoutout_id: req.body.shoutoutId,
                        stripe_tx_id: charge.id,
                        caption: req.body.shoutoutCaption,
                        media_link: req.body.shoutoutMediaLink,
                        publish_time: req.body.shoutoutPublishTime,
                        price_option: req.body.priceOptionName,
                        price: shoutoutPrice.price
                    });
                })
                .then(charge => {
                    res.json(charge);
                })
                .catch(error => {
                    console.log("Oops, something went wrong. " + error);
                });
            }

        }
    )

});

module.exports = router;