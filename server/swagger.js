import swaggerAutogen from "swagger-autogen";
import fs from "node:fs";

const swagger = swaggerAutogen({
  openapi: "3.0.0",
});

const doc = {
  info: {
    title: "PorishkarBD - Waste Reports API",
    description: "Feature 01: Waste Reports API documentation",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local backend server",
    },
  ],
  tags: [
    {
      name: "Waste Reports",
      description: "Feature 01 - Waste reporting operations",
    },
  ],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.js"];

// Generate documentation from Express routes
await swagger(outputFile, endpointsFiles, doc);

// Read generated documentation
const generated = JSON.parse(fs.readFileSync(outputFile, "utf8"));

// Keep only Feature 01 endpoints
const allowedPaths = ["/api/reports", "/api/reports/my", "/api/reports/{id}"];

const filteredPaths = {};

for (const path of allowedPaths) {
  if (generated.paths[path]) {
    filteredPaths[path] = generated.paths[path];
  }
}

// Configure JWT Bearer authentication
generated.components = generated.components || {};
generated.components.securitySchemes = {
  ...(generated.components.securitySchemes || {}),
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};

// Reusable error response schema
const errorSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "Server error",
    },
    error: {
      type: "string",
      description: "Additional error details, when provided.",
    },
  },
};

// Reusable user schemas
const userSummarySchema = {
  type: "object",
  properties: {
    _id: {
      type: "string",
      example: "672a12345678901234567891",
    },
    name: {
      type: "string",
      example: "Abrar Ahmed",
    },
    email: {
      type: "string",
      format: "email",
      example: "abrar@example.com",
    },
  },
};

const userDetailSchema = {
  allOf: [
    {
      $ref: "#/components/schemas/UserSummary",
    },
    {
      type: "object",
      properties: {
        phone: {
          type: "string",
          example: "01712345678",
        },
      },
    },
  ],
};

// Full WasteReport document based on the Mongoose model
const wasteReportSchema = {
  type: "object",
  required: ["reportedBy", "category", "description", "location"],
  properties: {
    _id: {
      type: "string",
      example: "672a12345678901234567890",
    },
    reportedBy: {
      type: "string",
      description: "MongoDB ObjectId of the reporting user.",
      example: "672a12345678901234567891",
    },
    assignedCollector: {
      type: "string",
      nullable: true,
      description: "MongoDB ObjectId of the assigned collector.",
    },
    category: {
      type: "string",
      enum: [
        "Household",
        "Industrial",
        "Medical",
        "Construction",
        "Water Body Pollution",
      ],
      example: "Household",
    },
    description: {
      type: "string",
      example: "Household waste dumped beside the road.",
    },
    location: {
      type: "object",
      required: ["lat", "lng", "address"],
      properties: {
        lat: {
          type: "number",
          example: 23.7806,
        },
        lng: {
          type: "number",
          example: 90.407,
        },
        address: {
          type: "string",
          example: "Dhaka, Bangladesh",
        },
      },
    },
    collectorLocation: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          nullable: true,
        },
        lng: {
          type: "number",
          nullable: true,
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
      },
    },
    pickupDate: {
      type: "string",
      format: "date-time",
      nullable: true,
    },
    pickupTime: {
      type: "string",
      nullable: true,
    },
    routeOrder: {
      type: "number",
      nullable: true,
    },
    isPriority: {
      type: "boolean",
      example: false,
    },
    images: {
      type: "array",
      items: {
        type: "string",
        example: "https://example.com/waste-image.jpg",
      },
    },
    caseReference: {
      type: "string",
      example: "PBD-2026-00001",
    },
    status: {
      type: "string",
      enum: [
        "Reported",
        "Assigned",
        "Collector En Route",
        "Cleanup In Progress",
        "Resolved",
        "Closed",
        "Cancelled",
        "Under Investigation",
      ],
      example: "Reported",
    },
    proofOfCollection: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          nullable: true,
        },
        uploadedAt: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
        location: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              nullable: true,
            },
            longitude: {
              type: "number",
              nullable: true,
            },
          },
        },
      },
    },
    isDisputed: {
      type: "boolean",
      example: false,
    },
    disputeDetails: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          example: "",
        },
        raisedAt: {
          type: "string",
          format: "date-time",
          nullable: true,
        },
        status: {
          type: "string",
          enum: ["Pending", "Under Investigation", "Resolved", "Dismissed"],
          example: "Pending",
        },
      },
    },
    estimatedVolume: {
      type: "string",
      enum: ["Small", "Medium", "Large"],
      example: "Medium",
    },
    priority: {
      type: "string",
      enum: ["Low", "Medium", "High", "Critical"],
      example: "Medium",
    },
    priorityOverridden: {
      type: "boolean",
      example: false,
    },
    priorityHistory: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: {
            type: "string",
            enum: ["Low", "Medium", "High", "Critical"],
          },
          changedBy: {
            type: "string",
            enum: ["system", "admin"],
          },
          reason: {
            type: "string",
          },
          changedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
    __v: {
      type: "number",
    },
  },
};

// Remove reportedBy from the shared properties.
// Populated schemas will define it separately.
const { reportedBy, ...wasteReportPropertiesWithoutReporter } =
  wasteReportSchema.properties;

// Report with populated reporter information for GET /api/reports
const populatedWasteReportSchema = {
  type: "object",
  required: wasteReportSchema.required,
  properties: {
    ...wasteReportPropertiesWithoutReporter,
    reportedBy: {
      $ref: "#/components/schemas/UserSummary",
    },
  },
};

// Report with detailed reporter information for GET /api/reports/{id}
const detailedWasteReportSchema = {
  type: "object",
  required: wasteReportSchema.required,
  properties: {
    ...wasteReportPropertiesWithoutReporter,
    reportedBy: {
      $ref: "#/components/schemas/UserDetail",
    },
  },
};

// Smaller report object returned by POST /api/reports
const createdReportSchema = {
  type: "object",
  required: [
    "id",
    "caseReference",
    "category",
    "description",
    "location",
    "images",
    "status",
    "estimatedVolume",
    "priority",
    "createdAt",
  ],
  properties: {
    id: {
      type: "string",
      example: "672a12345678901234567890",
    },
    caseReference: {
      type: "string",
      example: "PBD-2026-00001",
    },
    category: {
      type: "string",
      enum: [
        "Household",
        "Industrial",
        "Medical",
        "Construction",
        "Water Body Pollution",
      ],
      example: "Household",
    },
    description: {
      type: "string",
      example: "Household waste dumped beside the road.",
    },
    location: {
      type: "object",
      required: ["lat", "lng", "address"],
      properties: {
        lat: {
          type: "number",
          example: 23.7806,
        },
        lng: {
          type: "number",
          example: 90.407,
        },
        address: {
          type: "string",
          example: "Dhaka, Bangladesh",
        },
      },
    },
    images: {
      type: "array",
      items: {
        type: "string",
      },
    },
    status: {
      type: "string",
      example: "Reported",
    },
    estimatedVolume: {
      type: "string",
      enum: ["Small", "Medium", "Large"],
      example: "Medium",
    },
    priority: {
      type: "string",
      enum: ["Low", "Medium", "High", "Critical"],
      example: "Medium",
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
  },
};

// Register reusable schemas
generated.components.schemas = {
  ...(generated.components.schemas || {}),
  WasteReport: wasteReportSchema,
  UserSummary: userSummarySchema,
  UserDetail: userDetailSchema,
  PopulatedWasteReport: populatedWasteReportSchema,
  DetailedWasteReport: detailedWasteReportSchema,
  CreatedReport: createdReportSchema,
};

// Ensure root path exists
filteredPaths["/api/reports"] = filteredPaths["/api/reports"] || {};

// POST /api/reports - Create a waste report
filteredPaths["/api/reports"].post = {
  tags: ["Waste Reports"],
  summary: "Create a waste report",
  description:
    "Allows an authenticated citizen to submit a waste report with optional images. The location field must contain a JSON string with lat, lng, and address. Maximum 5 images are allowed.",
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          required: ["category", "description", "location"],
          properties: {
            category: {
              type: "string",
              enum: [
                "Household",
                "Industrial",
                "Medical",
                "Construction",
                "Water Body Pollution",
              ],
              example: "Household",
            },
            description: {
              type: "string",
              example: "Household waste dumped beside the road.",
            },
            location: {
              type: "string",
              description: "JSON string containing lat, lng, and address.",
              example:
                '{"lat":23.7806,"lng":90.407,"address":"Dhaka, Bangladesh"}',
            },
            estimatedVolume: {
              type: "string",
              enum: ["Small", "Medium", "Large"],
              default: "Medium",
              example: "Medium",
            },
            images: {
              type: "array",
              maxItems: 5,
              items: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Report submitted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Report submitted successfully",
              },
              ecoPoints: {
                type: "object",
                nullable: true,
                properties: {
                  pointsEarned: {
                    type: "number",
                    example: 10,
                  },
                  newBalance: {
                    type: "number",
                    example: 50,
                  },
                },
              },
              report: {
                $ref: "#/components/schemas/CreatedReport",
              },
            },
          },
        },
      },
    },
    400: {
      description:
        "Required fields missing, invalid location format, or missing location properties",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description:
                  "Possible messages: Category, description, and location are required; Invalid location format; Location must include lat, lng, and address.",
                example: "Category, description, and location are required",
              },
            },
          },
        },
      },
    },
    401: {
      description: "Authentication required",
    },
    403: {
      description: "Only citizens can submit waste reports",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
};

// GET /api/reports - Retrieve all reports (admin only)
filteredPaths["/api/reports"].get = {
  tags: ["Waste Reports"],
  summary: "Retrieve all waste reports",
  description:
    "Allows an authenticated administrator to retrieve all waste reports. Reporter name and email are populated. Reports are sorted by creation date, newest first.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Reports retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              reports: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/PopulatedWasteReport",
                },
              },
            },
          },
        },
      },
    },
    401: {
      description: "Authentication required",
    },
    403: {
      description: "Admin access required",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
};

// GET /api/reports/my - Retrieve current user's reports
filteredPaths["/api/reports/my"] = {
  get: {
    tags: ["Waste Reports"],
    summary: "Retrieve my waste reports",
    description:
      "Retrieves all waste reports submitted by the currently authenticated user, sorted by creation date, newest first. The reportedBy and assignedCollector fields contain user IDs.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "User's reports retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                reports: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/WasteReport",
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: "Authentication required",
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  },
};

// GET /api/reports/{id} - Retrieve one report
filteredPaths["/api/reports/{id}"] = {
  get: {
    tags: ["Waste Reports"],
    summary: "Retrieve a waste report by ID",
    description:
      "Retrieves a specific waste report. Only the report owner or an administrator can access it. The reportedBy field is populated with name, email, and phone.",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "MongoDB report ID",
        schema: {
          type: "string",
          example: "672a12345678901234567890",
        },
      },
    ],
    responses: {
      200: {
        description: "Report retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                report: {
                  $ref: "#/components/schemas/DetailedWasteReport",
                },
              },
            },
          },
        },
      },
      401: {
        description: "Authentication required",
      },
      403: {
        description: "User is not authorized to view this report",
      },
      404: {
        description: "Report not found",
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    },
  },
};

// Remove automatically generated authorization header parameters.
// JWT authentication is already handled by bearerAuth.
for (const path of Object.keys(filteredPaths)) {
  for (const method of Object.keys(filteredPaths[path])) {
    const operation = filteredPaths[path][method];

    operation.tags = ["Waste Reports"];
    operation.security = [{ bearerAuth: [] }];

    if (operation.parameters) {
      operation.parameters = operation.parameters.filter(
        (param) => param.name.toLowerCase() !== "authorization",
      );
    }
  }
}

// Save only Feature 01 documentation
generated.paths = filteredPaths;

fs.writeFileSync(outputFile, JSON.stringify(generated, null, 2));

console.log("Feature 01 - Waste Reports documentation generated successfully!");
