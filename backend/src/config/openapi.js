// Hand-written OpenAPI 3.0 spec for the Hue.U backend, served via
// swagger-ui-express at /api-docs. Kept as a plain object (rather than parsed
// from JSDoc) so it stays a single lightweight dependency and the shapes match
// the controllers exactly. Field names below mirror the routes/controllers:
//   - analyze-skin: multipart field "image"      (skinAnalysis.routes.js)
//   - try-on:       "src_image"/"ref_image" files + text ids/url + garment_category
//   - products:     query "season"
const env = require('./env');

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hue.U Backend API',
    version: '1.0.0',
    description:
      'Skin-tone analysis, seasonal color matching, and virtual try-on. ' +
      'These endpoints need no auth header from the caller; the PerfectCorp V2 ' +
      'API key is used server-side only. See TESTING.md for curl examples.'
  },
  servers: [
    { url: `http://localhost:${env.PORT}`, description: 'Local dev server' }
  ],
  tags: [
    { name: 'Health', description: 'Liveness' },
    { name: 'Analysis', description: 'Skin-tone → season analysis' },
    { name: 'Products', description: 'Season-matched product catalog' },
    { name: 'Try-On', description: 'Virtual try-on (VTO)' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness check',
        responses: {
          200: {
            description: 'Server is up',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' }
              }
            }
          }
        }
      }
    },

    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products, optionally filtered by season',
        parameters: [
          {
            name: 'season',
            in: 'query',
            required: false,
            description: 'Omit to return all products. Invalid value → 400.',
            schema: {
              type: 'string',
              enum: ['spring', 'summer', 'autumn', 'winter']
            }
          }
        ],
        responses: {
          200: {
            description: 'Product list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid season',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },

    '/api/analyze-skin': {
      post: {
        tags: ['Analysis'],
        summary: 'Analyze a face photo → undertone, contrast, season, palette',
        description:
          'Upload a clear front-facing face photo. Requires a valid PerfectCorp ' +
          'V2 API key server-side. ⭐ Test this first — its PerfectCorp response ' +
          'shape (results.color.{skin,hair,eye}_color) is the critical thing to verify.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Face photo (images only, ≤ 10 MB)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Color profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnalyzeSkinResponse' }
              }
            }
          },
          400: {
            description: 'Missing/invalid image',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },

    '/api/try-on': {
      post: {
        tags: ['Try-On'],
        summary: 'Composite a garment onto a body photo (VTO)',
        description:
          'Provide a **source** (src_image file OR src_file_id) and a ' +
          '**reference** (ref_image file OR ref_file_id OR ref_image_url). ' +
          'Requires a valid PerfectCorp V2 API key server-side.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  src_image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Model/body photo (upload). Use this OR src_file_id.'
                  },
                  src_file_id: {
                    type: 'string',
                    description: 'Reuse a file id from a prior task (e.g. analyze-skin src_file_id/dst_id). Use this OR src_image.'
                  },
                  ref_image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Garment image (upload). One of ref_image / ref_file_id / ref_image_url.'
                  },
                  ref_file_id: {
                    type: 'string',
                    description: 'Reuse an uploaded garment file id.'
                  },
                  ref_image_url: {
                    type: 'string',
                    description: 'Public URL of the garment image.'
                  },
                  garment_category: {
                    type: 'string',
                    enum: ['full_body', 'upper_body', 'lower_body'],
                    default: 'full_body'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Try-on result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TryOnResponse' }
              }
            }
          },
          400: {
            description: 'Missing source or reference / invalid category',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    }
  },

  components: {
    schemas: {
      Health: {
        type: 'object',
        properties: { status: { type: 'string', example: 'ok' } }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 13 },
          name: { type: 'string', example: 'Royal Blue Blazer' },
          season: {
            type: 'string',
            enum: ['spring', 'summer', 'autumn', 'winter'],
            example: 'winter'
          },
          color_name: { type: 'string', example: 'Royal Blue' },
          color_hex: { type: 'string', example: '#4169E1' },
          price: { type: 'number', example: 89.0 },
          currency: { type: 'string', example: 'USD' },
          garment_category: {
            type: 'string',
            enum: ['upper_body', 'lower_body', 'full_body'],
            example: 'upper_body'
          },
          image_url: { type: 'string', example: 'https://cdn.hue-u.example/products/royal-blue-blazer.jpg' }
        }
      },
      AnalyzeSkinResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              analysis: {
                type: 'object',
                properties: {
                  skin_color: { type: 'string', example: '#E0AC69' },
                  hair_color: { type: 'string', example: '#3B2A1A' },
                  eye_color: { type: 'string', example: '#5A4632' },
                  src_file_id: { type: 'string' },
                  dst_id: { type: 'string' }
                }
              },
              classification: {
                type: 'object',
                properties: {
                  undertone: { type: 'string', enum: ['warm', 'cool', 'neutral'], example: 'warm' },
                  contrast: { type: 'string', enum: ['high', 'low'], example: 'high' },
                  season: { type: 'string', enum: ['spring', 'summer', 'autumn', 'winter'], example: 'spring' }
                }
              },
              recommendations: {
                type: 'object',
                properties: {
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Coral' },
                        hex: { type: 'string', example: '#FF7F50' }
                      }
                    }
                  },
                  explanation: {
                    type: 'string',
                    example: 'Your warm, golden undertones and high contrast between your skin, hair, and eyes place you in the Spring palette, which flatters you with warm, clear, and bright shades.'
                  }
                }
              }
            }
          }
        }
      },
      TryOnResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://…/result.jpg' },
              dst_id: { type: 'string' },
              src_file_id: { type: 'string' }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'A face photo is required.' },
          code: { type: 'string', example: 'missing_file' }
        }
      }
    }
  }
};

module.exports = openapiSpec;
