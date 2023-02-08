const express = require("express");
const cors = require("cors");
const awscrt = require("aws-crt");
const iot = awscrt.iot;
const mqtt = awscrt.mqtt;

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const connection = build_direct_mqtt();

(async function connect() {
  await connection.connect();
})();

app.listen(3000, () =>
  console.log("server pronto sulla 3000")
);

// http://localhost:3000/luce?stato=on
app.get("/luce", async function (req, res) {
  console.log("in get luce", req.query.stato);
  let result = await sendMessage(req.query.stato, "led");
  if (result) res.send("messaggio inviato");
  else res.send("error: " + result);
});

async function sendMessage(message, topic) {
  try {
    //const decoder = new TextDecoder("utf8");
    // const on_publish = async (
    //   topic,
    //   payload,
    //   dup,
    //   qos,
    //   retain
    // ) => {
    //   const json = decoder.decode(payload);
    //   console.log(
    //     `Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`
    //   );
    //   console.log(json);
    //   const message = JSON.parse(json);
    //   if (message.sequence == argv.count) {
    //     resolve();
    //   }
    // };

    // await connection.subscribe(
    //   argv.topic,
    //   mqtt.QoS.AtLeastOnce,
    //   on_publish
    // );

    (async () => {
      connection.publish(
        topic,
        // JSON.stringify(message),
        message,
        mqtt.QoS.AtLeastOnce
      );
    })();
    return true;
  } catch (error) {
    return error;
  }
}

function build_direct_mqtt() {
  let config_builder =
    iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
      "Certificati\\certificate.pem.crt",
      "Certificati\\private.pem.key"
    );

  config_builder.with_certificate_authority_from_path(
    undefined,
    "Certificati\\AmazonRootCA1.pem"
  );

  config_builder.with_clean_session(false);
  config_builder.with_client_id("clientPogliani");
  config_builder.with_endpoint(
    "a2kur01j8rc1su-ats.iot.eu-central-1.amazonaws.com"
  );
  const config = config_builder.build();

  const client = new mqtt.MqttClient();
  return client.new_connection(config);
}
