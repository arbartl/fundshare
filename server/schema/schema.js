const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql");
const Client = require("../models/Client");
const Project = require("../models/Project");

// Client type
const ClientType = new GraphQLObjectType({
  name: "Client",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

// Project type
const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve: (project) => {
        return Client.findById(project.clientId);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    client: {
      type: ClientType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: (_, args) => {
        return Client.findById(args.id);
      },
    },
    clients: {
      type: new GraphQLList(ClientType),
      resolve: () => {
        return Client.find();
      },
    },
    project: {
      type: ProjectType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: (_, args) => {
        return Project.findById(args.id);
      },
    },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve: () => {
        return Project.find();
      },
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addClient: {
      type: ClientType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        const client = new Client({
          name: args.name,
          phone: args.phone,
          email: args.phone,
        });

        return client.save();
      },
    },
    deleteClient: {
      type: ClientType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Client.findByIdAndRemove(args.id);
      },
    },
    addProject: {
      type: ProjectType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        status: {
          type: new GraphQLEnumType({
            name: "ProjecStatus",
            values: {
              new: { value: "Not Started" },
              progress: { value: "In Progess" },
              completed: { value: "Completed" },
            },
          }),
          defaultValue: "Not Started",
        },
        clientId: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const project = new Project({
          name: args.name,
          description: args.description,
          status: args.status,
          clientId: args.clientId,
        });

        return project.save();
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
