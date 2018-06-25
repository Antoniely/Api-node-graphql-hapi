const hapi = require('hapi');
const mongoose = require('mongoose');
const Painting = require('./models/Painting');



const {graphiqlHapi, graphqlHapi  } = require('apollo-server-hapi');
const schema = require('./graphql/schema');

// Swagger
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

//MLAB DB mongo
mongoose.connect("mongodb://admin:admin123@ds161610.mlab.com:61610/modern_api");
mongoose.connection.once('open', () => {
    console.log("Connected to database")
});

const server = hapi.server({
    port: 4000,
    host: 'localhost'
});
const init = async () => {


    await server.register({
        plugin: graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql'
            },
            route: {
                cors: true
            }
        }
    });

    await server.register({
        plugin: graphqlHapi,
        options: {
            path: '/graphql',
            graphqlOptions: {
                schema
            },
            route: {
                cors: true
            }
        }
    });

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
                options: {
                     info: {
                            title: 'Paintings API Documentation',
                            version: Pack.version
                     }
                }
        }
    ]);


    server.route([
        {
            method: 'GET',
            path: '/api/v1/paintings',
            config: {
                description: 'Get all the paintings',
                tags: ['api', 'v1', 'painting']
            },
            handler: (req, reply) => {
                return Painting.find();
            }
        },
        {
            method: 'POST',
            path: '/api/v1/paintings',
            config: {
                description: 'Get a specific painting by ID.',
                tags: ['api', 'v1', 'painting']
            },
            handler: (req, reply) => {
                const { name, url, technique } = req.payload;
                const painting = new Painting({
                    name,
                    url,
                    technique
                });

                return painting.save();
            }
        }
    ]);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unHandledRejection', (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
});

init();
