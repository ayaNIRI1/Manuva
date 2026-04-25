1. Return a list of all artisan names wrapped in <artisan_name> tags:
for $a in doc("manuva.xml")//artisan
return <artisan_name>{$a/name/text()}</artisan_name>

2. Find the total amount spent by customer 'c1':
let $orders := doc("manuva.xml")//order[@customer_id='c1']
return <total_spent>{sum($orders/total)}</total_spent>

3. List products along with their respective artisan's name:
for $a in doc("manuva.xml")//artisan,
    $p in $a/products/product
return <item>
         <artisan>{$a/name/text()}</artisan>
         <product>{$p/name/text()}</product>
       </item>

4. Find products that cost more than 50 and are currently in stock, sorted by price descending:
for $p in doc("manuva.xml")//product
where $p/price > 50 and $p/stock > 0
order by xs:decimal($p/price) descending
return $p/name

5. Generate an HTML list of all customers and their respective cities:
<ul>
{
  for $c in doc("manuva.xml")//customer
  return <li>{$c/name/text()} from {$c/city/text()}</li>
}
</ul>

6. Count the number of orders each customer has placed:
for $c in doc("manuva.xml")//customer
let $orderCount := count(doc("manuva.xml")//order[@customer_id = $c/@id])
return <customer_summary name="{$c/name}" order_count="{$orderCount}"/>

7. Find the most expensive product in the marketplace:
let $maxPrice := max(doc("manuva.xml")//product/price)
for $p in doc("manuva.xml")//product
where $p/price = $maxPrice
return <most_expensive>{$p/name/text()}</most_expensive>

8. Calculate total revenue derived only from 'Delivered' orders:
let $delivered := doc("manuva.xml")//order[@status='Delivered']
return <revenue>{sum($delivered/total)}</revenue>

9. Group product names by their category:
for $category in distinct-values(doc("manuva.xml")//product/@category)
return <category name="{$category}">
         {
           for $p in doc("manuva.xml")//product[@category=$category]
           return <product_name>{$p/name/text()}</product_name>
         }
       </category>

10. Identify artisans who have at least one product completely out of stock:
for $a in doc("manuva.xml")//artisan
where some $p in $a/products/product satisfies $p/stock = 0
return <needs_restock>{$a/name/text()}</needs_restock>
