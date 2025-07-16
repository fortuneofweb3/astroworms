import { createEdgeClient, BadgesCondition } from "@honeycomb-protocol/edge-client";
import { Keypair, PublicKey, Connection, Transaction, VersionedTransaction } from "@solana/web3.js";

const API_URL = "https://edge.test.honeycombprotocol.com/";
const client = createEdgeClient(API_URL, true);

const ADMIN_PRIVATE_KEY = new Uint8Array([11,19,204,164,138,197,136,248,189,197,248,86,194,73,91,154,161,225,131,183,183,222,20,62,126,127,0,218,219,210,141,17,248,9,97,110,228,162,26,177,140,119,176,6,125,151,112,62,61,182,200,85,5,192,131,168,244,81,19,207,233,37,213,180]);
const adminKeypair = Keypair.fromSecretKey(ADMIN_PRIVATE_KEY);

const connection = new Connection("https://rpc.test.honeycombprotocol.com", "confirmed");

async function signAndSend(txResponse, keypair) {
  console.log('txResponse:', txResponse);
  const base64Tx = txResponse.transaction || txResponse.versionedTransaction;
  let tx = VersionedTransaction.from(Buffer.from(base64Tx, "base64"));
  tx.sign(keypair);
  const signature = await connection.sendTransaction(tx);
  await connection.confirmTransaction({
    signature,
    blockhash: txResponse.blockhash,
    lastValidBlockHeight: txResponse.lastValidBlockHeight
  }, "confirmed");
  console.log("Transaction confirmed:", signature);
  return signature;
}

async function setupProject() {
  try {
    // Create project
    const projectResponse = await client.createCreateProjectTransaction({
      name: "Astroworm Game",
      description: "Cosmic Serpent Reality Coil",
      authority: adminKeypair.publicKey.toString(),
      payer: adminKeypair.publicKey.toString(),
      profileDataConfig: {
        achievements: [
          "First Steps",
          "Cosmic Novice",
          "Reality Bender",
          "Coil Master",
          "Growing Serpent",
          "Cosmic Titan",
          "Speed Demon",
          "Dimensional Survivor",
          "Cosmic Glutton",
          "Fragment Collector",
          "Coil Veteran",
          "Time Attacker",
          "Reality Perfectionist",
          "Cosmic Leviathan",
          "Dimensional Dedication"
        ],
        customDataFields: [
          "High Score",
          "Longest Snake",
          "Spheres Eaten",
          "Games Played",
          "Total Play Time"
        ]
      }
    });
    console.log("Project API Response:", projectResponse);
    const { project: projectAddress, tx: txResponse } = projectResponse.createCreateProjectTransaction;
    await signAndSend(txResponse, adminKeypair);
    console.log("Project created:", projectAddress);

    // Create badges
    const badges = [
      { name: 'First Steps', description: 'Play your first game', uri: 'https://gateway.pinata.cloud/ipfs/bafkreibt3udhiaocwd6wjx746zaapsr5hocgizl5peyofzhx7x7qceeezq' },
      { name: 'Cosmic Novice', description: 'Reach 250 points', uri: 'https://gateway.pinata.cloud/ipfs/bafkreibu5trvudhkdzppt2dmck2j24gs5jahjywjpoucsc64worltvogty' },
      { name: 'Reality Bender', description: 'Reach 1000 points', uri: 'https://gateway.pinata.cloud/ipfs/bafkreic3it5v6zki77wpw4jzkvjsbl5aqh6bmrykggfeoxblebf7lukwty' },
      { name: 'Coil Master', description: 'Reach 2500 points', uri: 'https://gateway.pinata.cloud/ipfs/bafkreigcsm2szn2eb57km4qbkpc7h7fjfd4xzbbgdps6q6sa4vka5xh3ye' },
      { name: 'Growing Serpent', description: 'Reach 30 segments', uri: 'https://gateway.pinata.cloud/ipfs/bafkreiaahnz355becw3fpzdrn4rkfrgqzfmk3vs4mwldlycvoazitqq4ni' },
      { name: 'Cosmic Titan', description: 'Reach 75 segments', uri: 'https://gateway.pinata.cloud/ipfs/bafkreibmubvowdpupbnaw26u5v5ichesuwn7tq4wzfsr6octuovrf66ery' },
      { name: 'Speed Demon', description: 'Complete a timed game with 30+ seconds left', uri: 'https://gateway.pinata.cloud/ipfs/bafkreiffvrmyxrlk2ihzsd5mi47qj7p5m4ptv6u3bi3menzv7kzojzhi4q' },
      { name: 'Dimensional Survivor', description: 'Survive for 5 minutes in one game', uri: 'https://gateway.pinata.cloud/ipfs/bafkreicd7ja2r2dlwroy5pals5ub3i2u7ps3rvhcloefrngbmpw3lm5bem' },
      { name: 'Cosmic Glutton', description: 'Eat 250 cosmic fragments total', uri: 'https://gateway.pinata.cloud/ipfs/bafkreicoebcuqsfty2djfvjxbqyvavikddyxseu3ysud7jefi5wblmu2aa' },
      { name: 'Fragment Collector', description: 'Eat 1000 cosmic fragments total', uri: 'https://gateway.pinata.cloud/ipfs/bafkreidnba4abtqm4cstmlinn4eob4snmzaprz5k6a5wpfu7vzbco3swze' },
      { name: 'Coil Veteran', description: 'Play 25 games', uri: 'https://gateway.pinata.cloud/ipfs/bafkreibjglkng3nznlzul4blgd6geolajrgawlvld7joe3flrna34j3yxm' },
      { name: 'Time Attacker', description: 'Score 500+ in timed mode', uri: 'https://gateway.pinata.cloud/ipfs/bafkreihnsjdqboecmmkgs4kowc4maomcpv32xj6r3boklrubpn267bwzwa' },
      { name: 'Reality Perfectionist', description: 'Score 5000+ points', uri: 'https://gateway.pinata.cloud/ipfs/bafkreicjdgiaiazqefk62jvwkf6aa32r5ph67obeqtzfg2bhzi4korv76i' },
      { name: 'Cosmic Leviathan', description: 'Reach 150 segments', uri: 'https://gateway.pinata.cloud/ipfs/bafkreicjdgiaiazqefk62jvwkf6aa32r5ph67obeqtzfg2bhzi4korv76i' },
      { name: 'Dimensional Dedication', description: 'Play for 120 minutes total', uri: 'https://gateway.pinata.cloud/ipfs/bafkreihbhwj6dcxakyidpyjkdf3aa4eln4zokxwqdez7k746lt6kyii73m' },
    ];

    for (let i = 0; i < badges.length; i++) {
      const badge = badges[i];
      const badgeResponse = await client.createCreateBadgeCriteriaTransaction({
        args: {
          authority: adminKeypair.publicKey.toString(),
          projectAddress: projectAddress,
          payer: adminKeypair.publicKey.toString(),
          criteriaIndex: i,
          condition: BadgesCondition.Public,
          startTime: 0,
          endTime: 0,
        },
      });
      console.log("Badge API Response for " + badge.name + ":", badgeResponse);
      const badgeTxResponse = badgeResponse.createCreateBadgeCriteriaTransaction;
      await signAndSend(badgeTxResponse, adminKeypair);
      console.log(`Badge created: ${badge.name}`);
    }

    console.log("Project setup complete. Project address:", projectAddress);
  } catch (error) {
    console.error("Setup error:", error);
  }
}

setupProject();