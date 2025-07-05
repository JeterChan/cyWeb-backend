const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '電商 API 文檔',
      version: '1.0.0',
      description: '電商網站的 RESTful API 文檔',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開發環境'
      }
    ],
    components: {
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '分類 ID'
            },
            name: {
              type: 'string',
              description: '分類名稱'
            },
            description: {
              type: 'string',
              description: '分類描述'
            },
            imageUrl: {
              type: 'string',
              description: '分類圖片 URL'
            },
            isActive: {
              type: 'boolean',
              description: '是否啟用'
            }
          },
          required: ['id', 'name']
        },

        Subcategory: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '子分類 ID'
            },
            name: {
              type: 'string',
              description: '子分類名稱'
            },
            description: {
              type: 'string',
              description: '子分類描述'
            },
            categoryId: {
              type: 'integer',
              description: '所屬分類 ID'
            },
            category: {
              $ref: '#/components/schemas/Category'
            },
            isActive: {
              type: 'boolean',
              description: '是否啟用'
            }
          },
          required: ['id', 'name', 'categoryId']
        },

        Product: {
          type: 'object',
          properties: {
            productNumber: {
              type: 'string',
              description: '商品編號'
            },
            name: {
              type: 'string',
              description: '商品名稱'
            },
            basePrice: {
              type: 'number',
              description: '基礎價格'
            },
            quantity: {
              type: 'integer',
              description: '庫存數量'
            },
            description: {
              type: 'string',
              description: '商品描述'
            },
            specification: {
              type: 'string',
              description: '商品規格'
            },
            image: {
              type: 'string',
              description: '商品圖片 URL'
            },
            subcategoryId: {
              type: 'integer',
              description: '子分類 ID'
            },
            subcategory: {
              $ref: '#/components/schemas/Subcategory'
            }
          },
          required: ['productNumber', 'name', 'basePrice', 'subcategoryId']
        },
        
        Order: {
          type: 'object',
          properties: {
            orderNumber: {
              type: 'string',
              description: '訂單編號'
            },
            companyName: {
              type: 'string',
              description: '公司名稱'
            },
            orderDate: {
              type: 'string',
              format: 'date-time',
              description: '訂單日期'
            },
            shippingAddress: {
              type: 'string',
              description: '送貨地址'
            },
            paymentMethod: {
              type: 'string',
              description: '付款方式'
            },
            totalAmount: {
              type: 'number',
              description: '總金額'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: '訂單狀態'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              },
              description: '訂單項目'
            }
          }
        },
        
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: '商品 ID'
            },
            name: {
              type: 'string',
              description: '商品名稱'
            },
            spec: {
              type: 'string',
              description: '商品規格'
            },
            price: {
              type: 'number',
              description: '單價'
            },
            quantity: {
              type: 'integer',
              description: '數量'
            },
            subtotal: {
              type: 'number',
              description: '小計'
            }
          }
        },
        
        Cart: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem'
              },
              description: '購物車項目'
            },
            totalAmount: {
              type: 'number',
              description: '總金額'
            },
            cartId: {
              type: 'string',
              description: '購物車 ID'
            }
          }
        },
        
        CartItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: '商品 ID'
            },
            name: {
              type: 'string',
              description: '商品名稱'
            },
            price: {
              type: 'number',
              description: '價格'
            },
            quantity: {
              type: 'integer',
              description: '數量'
            }
          }
        },

        // 通用回應格式
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '操作是否成功'
            },
            message: {
              type: 'string',
              description: '回應訊息'
            },
            data: {
              description: '回應資料'
            }
          }
        },

        // 錯誤回應格式
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: '錯誤訊息'
            },
            error: {
              type: 'string',
              description: '錯誤詳情'
            }
          }
        },

        // 購物車相關 Schemas
        CartItemDetail: {
          type: 'object',
          properties: {
            productId: {
              type: 'integer',
              description: '商品 ID',
              example: 1
            },
            productNumber: {
              type: 'string',
              description: '商品編號',
              example: 'P12345'
            },
            spec: {
              type: 'string',
              description: '商品規格',
              example: '6.7吋 Super Retina XDR 顯示器, 256GB'
            },
            name: {
              type: 'string',
              description: '商品名稱',
              example: 'iPhone 15 Pro Max'
            },
            price: {
              type: 'integer',
              description: '商品單價',
              example: 45900
            },
            quantity: {
              type: 'integer',
              description: '商品數量',
              minimum: 1,
              example: 2
            },
            subtotal: {
              type: 'integer',
              description: '小計金額',
              example: 91800
            }
          },
          required: ['productId', 'productNumber', 'name', 'price', 'quantity', 'subtotal']
        },

        AddToCartRequest: {
          type: 'object',
          required: ['productNumber', 'quantity'],
          properties: {
            productNumber: {
              type: 'string',
              description: '商品編號',
              example: 'P12345'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: '商品數量',
              example: 2
            }
          }
        },

        UpdateCartRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'integer',
              description: '商品 ID',
              example: 1
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: '更新後的商品數量（0 表示建議刪除）',
              example: 3
            }
          }
        },

        RemoveFromCartRequest: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: {
              type: 'integer',
              description: '要移除的商品 ID',
              example: 1
            }
          }
        },

        CartResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '操作是否成功',
              example: true
            },
            message: {
              type: 'string',
              description: '操作結果訊息',
              example: 'Product added to cart successfully'
            },
            cart: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItemDetail'
              },
              description: '購物車商品列表'
            },
            cartItemCount: {
              type: 'integer',
              description: '購物車商品種類數量',
              example: 1
            },
            totalItemCount: {
              type: 'integer',
              description: '購物車商品總數量',
              example: 2
            }
          },
          required: ['success', 'message']
        },

        RemoveCartResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '操作是否成功',
              example: true
            },
            message: {
              type: 'string',
              description: '操作結果訊息',
              example: 'Delete the product successfully!'
            },
            cartItemCount: {
              type: 'integer',
              description: '剩餘購物車商品種類數量',
              example: 0
            }
          },
          required: ['success', 'message', 'cartItemCount']
        },

        ClearCartResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '操作是否成功',
              example: true
            }
          },
          required: ['success']
        },

        // 管理員相關 Schemas
        OrderStatusResponse: {
          type: 'object',
          properties: {
            totalOrdersCount: {
              type: 'integer',
              description: '總訂單數量',
              example: 150
            },
            processingCount: {
              type: 'integer',
              description: '處理中的訂單數量',
              example: 25
            },
            deliveredCount: {
              type: 'integer',
              description: '已送達的訂單數量',
              example: 80
            },
            completedCount: {
              type: 'integer',
              description: '已完成的訂單數量',
              example: 40
            },
            cancelCount: {
              type: 'integer',
              description: '已取消的訂單數量',
              example: 5
            }
          },
          required: ['totalOrdersCount', 'processingCount', 'deliveredCount', 'completedCount', 'cancelCount']
        },

        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'delivered', 'completed', 'cancel'],
              description: '新的訂單狀態',
              example: 'delivered'
            }
          }
        },

        AdminSuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '操作是否成功',
              example: true
            },
            message: {
              type: 'string',
              description: '操作結果訊息',
              example: 'Order update successfully'
            }
          },
          required: ['success', 'message']
        }
      },
      
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionId',
          description: 'Session Cookie 認證 (Redis Session Store)'
        }
      },

      responses: {
        Success: {
          description: '操作成功',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              }
            }
          }
        },
        BadRequest: {
          description: '請求參數錯誤',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        Unauthorized: {
          description: '未授權',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: '資源不存在',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: '伺服器內部錯誤',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js'
]
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;