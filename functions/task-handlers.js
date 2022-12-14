//require('dotenv').config({path:__dirname+'/./../../.env'})
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;


const conversationTimeout = async (client, { TaskAttributes }) => {

    const { conversationSid } = JSON.parse(TaskAttributes)

    try {
        if (conversationSid) {
            await client.conversations.v1.conversations(conversationSid)
                .update({
                    'state': "closed",
                })
            console.log("[taskTimeout] conversationTimeout :: Conversations expired")
        } else {
            console.log("[taskTimeout] conversationTimeout :: Task doesn't have conversationSid")
        }

    } catch (e) {
        console.log("[taskTimeout] conversationTimeout :: Error", e)
    }

    return;

}


const TaskTimeout = async (client, event) => {

    console.log("[taskTimeout] handler :: ", event)

    await conversationTimeout(client, event)

    console.log("[taskTimeout] handler :: Success")

    return
}


exports.handler = async (context, event, callback) => {


    const { EventType } = event;
    const client = context.getTwilioClient();
    let res = {}
    console.log("[Task Router Event Handler] handler :: Event ", EventType)

    switch (EventType) {
        case "task.canceled":
            if (event.Reason === "Task TTL Exceeded" || event.Reason === "Task TTL Exceeded or Max assignment count exceeded")
                res = await TaskTimeout(client, event)
            break
    }

    console.log("[Task Router Event Handler] handler :: Success")

    callback(null, res)

}