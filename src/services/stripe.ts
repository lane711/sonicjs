

// const stripeWebHook = () =>{

//   return { received: true };
// });

// const stripeWebHookPost = (context) =>{



//   console.log(context, {message: 'STRIPE BEGIN'});
  

//   const { STRIPE_SECRET_API_KEY, STRIPE_WEBHOOK_SECRET } = context.locals.runtime.env(context);
//   const stripe = new Stripe(STRIPE_SECRET_API_KEY);
//   const signature = context.req.header('stripe-signature');

//   // console.log('STRIPE_SECRET_API_KEY', STRIPE_SECRET_API_KEY);
//   // console.log('STRIPE_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET);
//   // console.log('signature', signature);

//   try {
//     if (!signature) {
//       return context.text('', 400);
//     }
//     const body = await context.req.text();
//     const event = await stripe.webhooks.constructEventAsync(
//       body,
//       signature,
//       STRIPE_WEBHOOK_SECRET
//     );

//     log(context, event.data.object);

//     switch (event.type) {
//       case 'invoice.paid': {
//         console.log(event.data.object);
//         log(context, {message: `invoice.paid email', ${event.data.object.customer_email}`});
//         break;
//       }
//       case 'customer.subscription.created': {
//         log(context, {message: `customer.subscription.created', ${event.data.object.customer_email}`});
//         break
//       }
//       default:
//         log(context, { message: `Unhandled event type: ${event.type}, ` });
//         console.log('event--->', event);
//         break;
//     }
//     return context.text('', 200);
//   } catch (err) {
//     const errorMessage = `⚠️  Webhook signature verification failed. ${
//       err instanceof Error ? err.message : 'Internal server error'
//     }`;
//     console.log(errorMessage);
//     return context.text(errorMessage, 400);
//   }
// });

// export { stripeApi };

// //events

// // invoice.paid

// // invoice.payment_failed
