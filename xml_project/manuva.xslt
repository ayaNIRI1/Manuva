<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Manuva - Marketplace Data Overview</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 20px; font-size: 14px; }
          h1, h2 { color: #2c3e50; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
          th, td { border: 1px solid #bdc3c7; padding: 10px; text-align: left; }
          th { background-color: #ecf0f1; }
          .out-of-stock { color: #e74c3c; font-weight: bold; }
          .highlight { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Manuva E-Commerce Marketplace - Database Overview</h1>
        
        <h2>1. Artisans and Products</h2>
        <xsl:for-each select="manuva/artisans/artisan">
          <div class="highlight" style="padding: 10px; margin-bottom: 20px; border: 1px solid #ccc;">
            <h3>Artisan: <xsl:value-of select="name"/> (<xsl:value-of select="specialty"/>)</h3>
            <p><strong>Email:</strong> <xsl:value-of select="email"/></p>
            
            <h4>Product Catalog</h4>
            <table>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price ($)</th>
                <th>Stock Level</th>
                <th>Rating</th>
              </tr>
              <xsl:for-each select="products/product">
                <tr>
                  <td><xsl:value-of select="name"/></td>
                  <td><xsl:value-of select="@category"/></td>
                  <td><xsl:value-of select="price"/></td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="stock &gt; 0">
                        <xsl:value-of select="stock"/>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="out-of-stock">Out of Stock</span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td><xsl:value-of select="rating"/> / 5.0</td>
                </tr>
              </xsl:for-each>
            </table>
          </div>
        </xsl:for-each>

        <h2>2. Registered Customers</h2>
        <table>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>City</th>
          </tr>
          <xsl:for-each select="manuva/customers/customer">
            <tr>
              <td><xsl:value-of select="@id"/></td>
              <td><xsl:value-of select="name"/></td>
              <td><xsl:value-of select="email"/></td>
              <td><xsl:value-of select="city"/></td>
            </tr>
          </xsl:for-each>
        </table>

        <h2>3. Order History</h2>
        <table>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Total Amount ($)</th>
            <th>Status</th>
          </tr>
          <xsl:for-each select="manuva/orders/order">
            <xsl:sort select="@date" order="descending"/>
            <tr>
              <td><xsl:value-of select="@id"/></td>
              <td><xsl:value-of select="@date"/></td>
              <td><xsl:value-of select="@customer_id"/></td>
              <td><xsl:value-of select="total"/></td>
              <td>
                <xsl:choose>
                  <xsl:when test="@status = 'Delivered'">
                    <span style="color: green; font-weight: bold;"><xsl:value-of select="@status"/></span>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="@status"/>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
