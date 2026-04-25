# 1. Title of the topic
Manuva: An E-Commerce Marketplace for Artisans - Data Modeling and XML Processing

# 2. Author's name
[Insert Your Name Here]

# 3. Introduction
The "Manuva" platform is designed as an e-commerce marketplace tailored specifically for local artisans and craftsmen to sell their handmade products to customers. The core entities of this platform involve Artisans, Customers, Products, and Orders. This project involves modeling the data of the Manuva platform into an XML structure, constructing an XML Schema to enforce data validation, writing an XSLT stylesheet to present the XML data visually, and using XPath and XQuery to extract and manipulate the required information from the database efficiently. 

# 4. Presentation of the class diagram
The core structure of the Manuva platform can be modeled using the following key classes:
- **Artisan**: Represents a seller on the platform. Attributes include `id`, `name`, `email`, and `specialty`. An Artisan can have one-to-many Products.
- **Customer**: Represents a buyer on the platform. Attributes include `id`, `name`, `email`, and `city`. A Customer can place zero-to-many Orders.
- **Product**: Represents an item for sale. Attributes include `id`, `name`, `category`, `price`, `stock`, and `rating`.
- **Order**: Represents a purchase made by a Customer. Attributes include `id`, `date`, `total`, and `status`. An Order contains one-to-many OrderItems.
- **OrderItem**: An associative class representing the quantity of a specific Product in an Order. Attributes include `quantity` and `price`.

*(Note to student: Please recreate the above entities and relationships in Modelio as a formal UML Class Diagram and insert the exported image here for the final submission.)*

# 5. Presentation of the XML document representing your database
The database is represented via `manuva.xml`. It encapsulates the Artisans with their Products, Customers, and Orders.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manuva>
  <artisans>
    <artisan id="a1">
      <name>John Doe</name>
      <email>john@example.com</email>
      <specialty>Woodworking</specialty>
      <products>
        <product id="p1" category="Furniture">
          <name>Handcrafted Oak Chair</name>
          <price>150.00</price>
          <stock>12</stock>
          <rating>4.8</rating>
        </product>
        <product id="p2" category="Furniture">
          <name>Oak Dining Table</name>
          <price>500.00</price>
          <stock>3</stock>
          <rating>5.0</rating>
        </product>
        <product id="p3" category="Decor">
          <name>Wooden Sculpture</name>
          <price>80.00</price>
          <stock>0</stock>
          <rating>4.2</rating>
        </product>
      </products>
    </artisan>
    <artisan id="a2">
      <name>Jane Smith</name>
      <email>jane@example.com</email>
      <specialty>Pottery</specialty>
      <products>
        <product id="p4" category="Ceramics">
          <name>Clay Vase</name>
          <price>45.00</price>
          <stock>20</stock>
          <rating>4.9</rating>
        </product>
        <product id="p5" category="Ceramics">
          <name>Ceramic Mug Set</name>
          <price>35.00</price>
          <stock>50</stock>
          <rating>4.5</rating>
        </product>
      </products>
    </artisan>
  </artisans>
  
  <customers>
    <customer id="c1">
      <name>Alice Johnson</name>
      <email>alice@example.com</email>
      <city>London</city>
    </customer>
    <customer id="c2">
      <name>Bob Williams</name>
      <email>bob@example.com</email>
      <city>Manchester</city>
    </customer>
  </customers>
  
  <orders>
    <order id="o1" customer_id="c1" date="2026-04-10" status="Delivered">
      <items>
        <item product_id="p1" quantity="2" price="150.00"/>
        <item product_id="p4" quantity="1" price="45.00"/>
      </items>
      <total>345.00</total>
    </order>
    <order id="o2" customer_id="c2" date="2026-04-15" status="Processing">
      <items>
        <item product_id="p2" quantity="1" price="500.00"/>
      </items>
      <total>500.00</total>
    </order>
    <order id="o3" customer_id="c1" date="2026-04-20" status="Shipped">
      <items>
        <item product_id="p5" quantity="4" price="35.00"/>
      </items>
      <total>140.00</total>
    </order>
  </orders>
</manuva>
```

# 6. Listing of the XML schema and the XSLT stylesheet

### XML Schema (`manuva.xsd`)
The XML schema enforces the structure, data types, and relationships (using ID and IDREF) of the XML document.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="manuva">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="artisans" type="ArtisansType"/>
        <xs:element name="customers" type="CustomersType"/>
        <xs:element name="orders" type="OrdersType"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>

  <xs:complexType name="ArtisansType">
    <xs:sequence>
      <xs:element name="artisan" type="ArtisanType" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="ArtisanType">
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="email" type="xs:string"/>
      <xs:element name="specialty" type="xs:string"/>
      <xs:element name="products" type="ProductsType"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:ID" use="required"/>
  </xs:complexType>

  <xs:complexType name="ProductsType">
    <xs:sequence>
      <xs:element name="product" type="ProductType" maxOccurs="unbounded" minOccurs="0"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="ProductType">
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="price" type="xs:decimal"/>
      <xs:element name="stock" type="xs:integer"/>
      <xs:element name="rating" type="xs:decimal" minOccurs="0"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:ID" use="required"/>
    <xs:attribute name="category" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="CustomersType">
    <xs:sequence>
      <xs:element name="customer" type="CustomerType" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="CustomerType">
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="email" type="xs:string"/>
      <xs:element name="city" type="xs:string"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:ID" use="required"/>
  </xs:complexType>

  <xs:complexType name="OrdersType">
    <xs:sequence>
      <xs:element name="order" type="OrderType" maxOccurs="unbounded" minOccurs="0"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="OrderType">
    <xs:sequence>
      <xs:element name="items" type="ItemsType"/>
      <xs:element name="total" type="xs:decimal"/>
    </xs:sequence>
    <xs:attribute name="id" type="xs:ID" use="required"/>
    <xs:attribute name="customer_id" type="xs:IDREF" use="required"/>
    <xs:attribute name="date" type="xs:date" use="required"/>
    <xs:attribute name="status" type="xs:string" use="required"/>
  </xs:complexType>

  <xs:complexType name="ItemsType">
    <xs:sequence>
      <xs:element name="item" type="ItemType" maxOccurs="unbounded"/>
    </xs:sequence>
  </xs:complexType>

  <xs:complexType name="ItemType">
    <xs:attribute name="product_id" type="xs:IDREF" use="required"/>
    <xs:attribute name="quantity" type="xs:integer" use="required"/>
    <xs:attribute name="price" type="xs:decimal" use="required"/>
  </xs:complexType>
</xs:schema>
```

### XSLT Stylesheet (`manuva.xslt`)
The XSLT stylesheet is used to transform the XML data into a readable HTML format, displaying the Artisans, Customers, and Orders systematically.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Manuva - Marketplace Data</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 20px; font-size: 14px; }
          h1, h2 { color: #2c3e50; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
          th, td { border: 1px solid #bdc3c7; padding: 10px; text-align: left; }
          th { background-color: #ecf0f1; }
          .out-of-stock { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Manuva Database Overview</h1>
        
        <h2>Artisans and Products</h2>
        <xsl:for-each select="manuva/artisans/artisan">
          <div style="margin-bottom: 20px; padding:10px; border: 1px solid #ccc;">
            <h3>Artisan: <xsl:value-of select="name"/> (<xsl:value-of select="specialty"/>)</h3>
            <p>Email: <xsl:value-of select="email"/></p>
            <table>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price ($)</th>
                <th>Stock</th>
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

        <h2>Recent Orders</h2>
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
              <td><xsl:value-of select="@status"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

# 7. Presentation of the Queries (XPath and XQuery)

### XPath Queries
1. Select all product names available in the marketplace:
`//product/name/text()`

2. Find all products that belong to the 'Furniture' category:
`//product[@category='Furniture']`

3. Get the names of artisans who have products priced strictly over 100:
`//artisan[products/product/price > 100]/name/text()`

4. Retrieve all orders that have a status of 'Shipped':
`//order[@status='Shipped']`

5. Select the email address of the customer with ID 'c1':
`//customer[@id='c1']/email/text()`

6. Find the names of products that are currently out of stock (stock is 0):
`//product[stock=0]/name/text()`

7. Calculate the total number of orders placed in the system:
`count(//order)`

8. Select the names of the artisans whose specialty is either 'Ceramics' or 'Pottery':
`//artisan[specialty='Ceramics' or specialty='Pottery']/name/text()`

9. Find the names of products ordered in order 'o1':
`//product[@id = //order[@id='o1']/items/item/@product_id]/name/text()`

10. Calculate the total amount (revenue) from all orders:
`sum(//order/total)`

### XQuery Queries
1. Return a list of all artisan names wrapped in `<artisan_name>` tags:
```xquery
for $a in doc("manuva.xml")//artisan
return <artisan_name>{$a/name/text()}</artisan_name>
```

2. Find the total amount spent by customer 'c1':
```xquery
let $orders := doc("manuva.xml")//order[@customer_id='c1']
return <total_spent>{sum($orders/total)}</total_spent>
```

3. List products along with their respective artisan's name:
```xquery
for $a in doc("manuva.xml")//artisan,
    $p in $a/products/product
return <item>
         <artisan>{$a/name/text()}</artisan>
         <product>{$p/name/text()}</product>
       </item>
```

4. Find products that cost more than 50 and are currently in stock, sorted by descending price:
```xquery
for $p in doc("manuva.xml")//product
where $p/price > 50 and $p/stock > 0
order by xs:decimal($p/price) descending
return $p/name
```

5. Generate an HTML list of all customers and their respective cities:
```xquery
<ul>
{
  for $c in doc("manuva.xml")//customer
  return <li>{$c/name/text()} from {$c/city/text()}</li>
}
</ul>
```

6. Count the number of orders each customer has placed:
```xquery
for $c in doc("manuva.xml")//customer
let $orderCount := count(doc("manuva.xml")//order[@customer_id = $c/@id])
return <customer_summary name="{$c/name}" order_count="{$orderCount}"/>
```

7. Find the most expensive product in the marketplace:
```xquery
let $maxPrice := max(doc("manuva.xml")//product/price)
for $p in doc("manuva.xml")//product
where $p/price = $maxPrice
return <most_expensive>{$p/name/text()}</most_expensive>
```

8. Calculate total revenue derived only from 'Delivered' orders:
```xquery
let $delivered := doc("manuva.xml")//order[@status='Delivered']
return <revenue>{sum($delivered/total)}</revenue>
```

9. Group product names by their category:
```xquery
for $category in distinct-values(doc("manuva.xml")//product/@category)
return <category name="{$category}">
         {
           for $p in doc("manuva.xml")//product[@category=$category]
           return <product_name>{$p/name/text()}</product_name>
         }
       </category>
```

10. Identify artisans who have at least one product completely out of stock:
```xquery
for $a in doc("manuva.xml")//artisan
where some $p in $a/products/product satisfies $p/stock = 0
return <needs_restock>{$a/name/text()}</needs_restock>
```

# 8. Conclusion
In conclusion, XML provides a flexible and hierarchical structure for modeling the complex data relationships inherent in the Manuva e-commerce marketplace. Through the utilization of XML Schemas, the structural integrity of the database is robustly enforced. The XSLT transformation demonstrates a convenient approach for converting backend data into visually comprehensive formats. Furthermore, leveraging XPath and XQuery establishes an efficient and declarative method for retrieving precise segments of data required for operational analysis and business logic integration, thus confirming the effectiveness of XML-based data management for marketplace architectures.
