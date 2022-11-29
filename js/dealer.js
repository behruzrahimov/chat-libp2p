import { multiaddr } from "@multiformats/multiaddr";
import { createLibp2p } from "./libp2p.js";
import { stdinToStream, streamToConsole } from "./stream.js";
import { createFromJSON } from "@libp2p/peer-id-factory";
import peerIdDialerJson from "./peer-id-dialer.js";
import peerIdListenerJson from "./peer-id-listener.js";

async function run() {
  const [idDialer, idListener] = await Promise.all([
    createFromJSON(peerIdDialerJson),
    createFromJSON(peerIdListenerJson),
  ]);

  const nodeDialer = await createLibp2p({
    peerId: idDialer,
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
  });

  await nodeDialer.start();

  console.log("Dialer ready, listening on:");
  nodeDialer.getMultiaddrs().forEach((ma) => {
    console.log(ma.toString());
  });

  const listenerMa = multiaddr(
    `/ip4/127.0.0.1/tcp/10333/p2p/${idListener.toString()}`
  );
  const stream = await nodeDialer.dialProtocol(listenerMa, "/chat/1.0.0");

  console.log("Dialer dialed to listener on protocol: /chat/1.0.0");
  console.log("Type a message and see what happens");

  stdinToStream(stream);
  streamToConsole(stream);
}

run();
