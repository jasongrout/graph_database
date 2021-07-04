<?php
?>
<html> 
<head> 

<STYLE type="text/css">

table.results {
        border-collapse: collapse;
	border-width: thin;
	border-style: solid;
/*        width: 100%;*/
}

table.results td { 
  border-style: solid;
  border-width: thin;
  text-align: center;
  text-valign: middle;
 padding: 1px;
}

table.results thead td {
  font-weight: bolder;
  font-size: larger;
  text-align: center;
 padding: 5px;
}


</STYLE>


</head> 
<body> 

 
<?php 

// Clean out the empty entries



$debug=false;

require 'SafeSQL.class.php';

if($debug)
{
	//phpinfo();
   echo '<pre>'; 
   print_r($_REQUEST); 
   print_r($_POST); 
   print_r($QUERY); 
   echo '</pre>';
}


function error_handler($errno, $errstr, $errfile, $errline) {
  if($errno == E_USER_WARNING || $errno == E_USER_ERROR) {
    print "<h2>{$errstr}</h2>";
    if($debug) {
      print "({$errfile}:{$errline})<br/>";
    }
  }
  if($errno==E_USER_ERROR) {
    print "<h4>Query terminated.</h4>";
    print "</body></html>";
    die('');
  }
}

set_error_handler("error_handler");

function canonize_graphs($graph_list) {

   $descriptorspec = array(
    0 => array("pipe", "r"),  // stdin
    1 => array("pipe", "w"),  // stdout
    2 => array("pipe", "w")  // stderr ?? instead of a file
    );
   $process = proc_open("./labelg -q", $descriptorspec, $pipes);
   if (is_resource($process)) {
     fwrite($pipes[0], implode("\n",array_map("stripslashes",$graph_list)));
     if($debug)
       {
	 print_r(array_map("stripslashes",$graph_list));
       }
     fwrite($pipes[0],"\n");
    fclose($pipes[0]);
    while($g= fgets($pipes[1], 1024)) {
          // read from the pipe
          $canonical_graphs[]= $g;
    }
    fclose($pipes[1]);
    // optional:
    while($s= fgets($pipes[2], 1024)) {
      $canonical_graphs_errors[] = "\n<p>Error: $s</p>\n";
    }
    fclose($pipes[2]);
   }
   if(count($canonical_graphs_errors)>0) {
     if($debug) {
       echo "NAUTY ERRORS: ";
       print_r($canonical_graphs_errors);
       print_r($canonical_graphs);
       }
     $error_graph = $graph_list[count($canonical_graphs)];
     trigger_error("Error: The specified graph6 code \"{$error_graph}\" is not a valid graph6 code.\n",E_USER_ERROR);
   }
   return array_map("trim",$canonical_graphs);
 }
 
function array_filter_key($array, $key_signature){ 
   $thisarray = array (); 
   foreach($array as $key => $value) 
     {
       if(strstr($key,$key_signature) && strlen(trim($value))>0) 
 	$thisarray[$key] = $value; 
     }
   return $thisarray; 
} 

function array_trim($arr, $charlist=null){
    foreach($arr as $key => $value){
        if (is_array($value)) $result[$key] = array_trim($value, $charlist);
        else $result[$key] = trim($value, $charlist);
    }
    return $result;
 }


function extract_field_name($field_name, $suffix){ 
  return substr($field_name,0,strpos($field_name,$suffix));

} 


// set database server access variables: 
// TODO: Must set to appropriate values
$host = "HOST"; 
$user = "USER"; 
$pass = "PASSWORD"; 
$database = "DATABASE"; 
 
// open connection and select database
$connection = mysql_connect($host, $user, $pass) or die ("Unable to connect!"); 
mysql_select_db($database) or die ("Unable to select database!"); 

$euphamism = array(
    'graph6_canonical' => 'Graph6 code',
    'vertices' => 'Number of vertices',
    'edges' => 'Number of edges',
    'cycles' => 'Number of cycles',
    'hamiltonian_cycles' => 'Number of Hamiltonian cycles',
    'eulerian' => 'Eulerian',
    'planar' => 'Planar',
    'perfect' => 'Perfect',
    'lovasz_num' => 'Lovasz number',
    'vertex_connectivity' => 'Vertex connectivity',
    'edge_connectivity' => 'Edge connectivity',
    'components' => 'Number of components',
    'girth' => 'Girth',
    'radius' => 'Radius',
    'diameter' => 'Diameter',
    'clique_number' => 'Clique number',
    'independence_number' => 'Independence number',
    'cut_vertices' => 'Number of cut vertices',
    'min_vertex_cover' => 'Size of the minimum vertex cover',
    'spanning_trees' => 'Number of spanning trees',
    'deg_seq' => 'Degree sequence',
    'min_deg' => 'Minimum degree',
    'max_deg' => 'Maximum degree',
    'sum_deg' => 'Sum of degrees',
    'avg_deg' => 'Average degree',
    'stdev_deg' => 'Standard Deviation of degrees',
    'regular' => 'Regular',
    'complement' => 'Graph complement graph6 code',
    'spectrum' => 'Spectrum',
	 'energy_eig' => 'Energy',
    'min_eig' => 'Minimum eigenvalue',
    'max_eig' => 'Maximum eigenvalue',
    'stdev_eig' => 'Standard deviation of eigenvalues',
    'aut_grp_size' => 'Automorphism group size',
    'orbits' => 'Number of orbits',
    'fixed_points' => 'Number of fixed points',
    'vertex_transitive' => 'Vertex transitive',
    'edge_transitive' => 'Edge transitive',
    'subgraph_list' => 'Induced subgraphs');


$euphamism_pic = array(
		       'graph_id' => 'Graph',
		       'complement_id' => 'Complement');

// Set up the WHERE text
if(isset($_POST['CONDITIONS'])) {
  $VISIBLE_FIELDS = unserialize(gzinflate(base64_decode($_POST['VISIBLE_FIELDS'])));
  $safe_where_text = unserialize(gzinflate(base64_decode($_POST['CONDITIONS'])));
  $safe_where_values = unserialize(gzinflate(base64_decode($_POST['VALUES'])));
  $QUERY = unserialize(gzinflate(base64_decode($_POST['QUERY'])));
  $TOTALROWS = $_POST['TOTALROWS'];
  $query_pretty = gzinflate(base64_decode($_POST['QUERY_PRETTY']));
} else {

$QUERY=array_filter(array_trim($_POST),"strlen");
$QUERY['VISIBLE']=array_filter(array_trim($_POST['VISIBLE']),"strlen");
$QUERY['PICTURE']=array_filter(array_trim($_POST['PICTURE']),"strlen");


$safe_where_text[] = " 1=1 ";

foreach (array_filter_key($QUERY,"_BOTTOM") as $field => $val) {
    $safe_where_text[] = "[ AND ".extract_field_name($field, "_BOTTOM").">= %F ]";
    $show_query[]="[ AND ".$euphamism[extract_field_name($field,"_BOTTOM")]." >= %F]";
    $safe_where_values[]=$val;
}

foreach (array_filter_key($QUERY,"_TOP") as $field => $val) {
    $safe_where_text[] = "[ AND ".extract_field_name($field, "_TOP")."<= %F ]";
    $show_query[] = "[ AND ".$euphamism[extract_field_name($field, "_TOP")]." <= %F ]";
    $safe_where_values[]=$val;
}

foreach (array_filter_key($QUERY,"_TRUE") as $field => $val) {
    $safe_where_text[] = "[ AND ".extract_field_name($field, "_TRUE")."= %F ]";
    $show_query[] = "[ AND ".$euphamism[extract_field_name($field, "_TRUE")]." = %F ]";
    $safe_where_values[]=$val;
}

foreach (array_filter_key($QUERY,"_FALSE") as $field => $val) {
    $safe_where_text[] = "[ AND ".extract_field_name($field, "_FALSE")."= %F ]";
    $show_query[] = "[ AND ".$euphamism[extract_field_name($field, "_FALSE")]." = %F ]";
    $safe_where_values[]=$val;
}

foreach (array_filter_key($QUERY,"_CONTAINS_SUBGRAPH_ONE") as $field => $val) {
  $safe_where_text[] = "[ AND graph6_canonical in (select graph from subgraphs where subgraph in (%Q)) ]";
  $show_query[] = "[ AND induced subgraphs contain at least one of: %L ]";
  $safe_where_values[]=canonize_graphs(array_filter(array_map("trim",explode(',',$val)), "strlen"));
}

foreach (array_filter_key($QUERY,"_CONTAINS_SUBGRAPH_ALL") as $field => $val) {
  foreach (canonize_graphs(array_filter(array_map("trim",explode(',',$val)),"strlen")) as $subgraph) {
    $safe_where_text[] = "[ AND graph6_canonical in (select graph from subgraphs where subgraph = '%S') ]";
    $show_query[] = "[ AND induced subgraphs contain %S]";
    $safe_where_values[]=$subgraph;
  }
}

foreach (array_filter_key($QUERY,"_NOTCONTAINS_SUBGRAPH_ONE") as $field => $val) {
  $safe_where_text[] = " AND ( 1=0 ";
  $show_query[] = "AND (";
   foreach (canonize_graphs(array_filter(array_map("trim",explode(',',$val)),"strlen")) as $subgraph) {
     $safe_where_text[] = "[ OR graph6_canonical not in (select graph from subgraphs where subgraph =  '%S') ]";
     $show_query[] = "[ OR induced subgraphs do not contain %S ]";
     $safe_where_values[]=$subgraph;
   }  
  $safe_where_text[] = " ) ";
}

 foreach (array_filter_key($QUERY,"_NOTCONTAINS_SUBGRAPH_ALL") as $field => $val) {
  $safe_where_text[] = "[ AND graph6_canonical not in (select graph from subgraphs where subgraph in (%Q)) ]";
  $show_query[] = "[ AND  induced subgraphs do not contain:  %L ]";
  $safe_where_values[]=canonize_graphs(array_filter(array_map("trim",explode(',',$val)),"strlen"));
 }


foreach (array_filter_key($QUERY,"_CONTAINS_GRAPHS") as $field => $val) {
  $safe_where_text[] = "[ AND graph6_canonical in (%Q) ]";
  $show_query[] = "[ AND graph6 code is one of: %L ]";
  $safe_where_values[]=canonize_graphs(array_filter(array_map("trim",explode(',',$val)),"strlen"));
}

foreach (array_filter_key($QUERY,"_CONTAINS_DEGSEQ") as $field => $val) {
  $safe_where_text[] = "[ AND deg_seq in (%Q) ]";
  $show_query[] = "[ AND degree sequence is one of: %L ]";
  $safe_where_values[]=array_filter(array_map("trim",explode(',',$val)),"strlen");
}



$VISIBLE_FIELDS=implode(", ",array_diff(array_merge($QUERY['VISIBLE'],
						     array_diff($QUERY['PICTURE'],
								$QUERY['VISIBLE'])),
					 array('')));

}


$propogate = "<input type=hidden name=VISIBLE_FIELDS value='".base64_encode(gzdeflate(serialize($VISIBLE_FIELDS)))."'>\n";
$propogate .= "<input type=hidden name=CONDITIONS value='".base64_encode(gzdeflate(serialize($safe_where_text)))."'>\n";
$propogate .= "<input type=hidden name=VALUES value='".base64_encode(gzdeflate(serialize($safe_where_values)))."'>\n";
$propogate .= "<input type=hidden name=QUERY value='".base64_encode(gzdeflate(serialize($QUERY)))."'>\n";


$safesql =& new SafeSQL_MySQL($connection);

$query_string = "SELECT ";

if(!isset($TOTALROWS)) {
  $query_string .= " SQL_CALC_FOUND_ROWS ";
}


$query_string .= " graph6_canonical as currgraph ";

if($VISIBLE_FIELDS !='') {
  $query_string .= ", ";
  $query_string .= urldecode($VISIBLE_FIELDS);
}

$query_string .= " from graph_data JOIN degree_info ON graph_data.graph6_canonical=degree_info.graph6 ";
$query_string .= " JOIN subgraphs_info ON graph_data.graph6_canonical=subgraphs_info.graph ";
$query_string .= " JOIN spectrum_info ON graph_data.graph6_canonical=spectrum_info.graph ";


$query_string .= "where ".implode(' ', $safe_where_text);
$query_string .= " order by vertices, edges, graph6_canonical";
$query_string .= " [limit %I,%I]";



$safe_where_values[] = ($_POST['page']-1)*$_POST['rows_per_page'];

if(intval($_POST['rows_per_page'])<1) {
     $_POST['rows_per_page']=30;
}

$safe_where_values[] = $_POST['rows_per_page'];

$safe_q = $safesql->query($query_string,$safe_where_values);

if($debug) print_r($safe_where_values);

if(!isset($query_pretty)) {
  $show_q = $safesql->query(implode(' ',$show_query)." [AAA %I,%I]",$safe_where_values);
if($debug)   print_r("Pretty Query: ".$show_q);
  preg_match("/AND (.*) AAA/", $show_q, $matches);
  $query_pretty=stripslashes(preg_replace("/,/",", ",preg_replace("/AND/","<BR/>",$matches[1])));
}



if($debug) {
 echo '<pre>'; 
 print_r($safe_where_text); 
 print_r($safe_where_values); 
 print($query_string."\n\n");
 print($safe_q."\n\n");
 print_r($show_query);
 print_r("Pretty Query: ".$query_pretty);
 echo '</pre>';
}

 

// execute query 
$result = mysql_query($safe_q) or die ("Error in query: $safe_q. ".mysql_error()); 

if(!isset($TOTALROWS)) {
  $number_of_rows =  mysql_query("SELECT FOUND_ROWS();") or die ("Error in query: $safe_q. ".mysql_error()); 
  $number_of_rows_row = mysql_fetch_array($number_of_rows, MYSQL_NUM);
  $TOTALROWS = $number_of_rows_row[0];
}



$propogate .= "<input type=hidden name=TOTALROWS value='".$TOTALROWS."'>\n";
$propogate .= "<input type=hidden name=rows_per_page value='".$_POST['rows_per_page']."'>\n";
$propogate .= "<input type=hidden name=QUERY_PRETTY value='".base64_encode(gzdeflate($query_pretty))."'>\n";



// Calculate number of pages

$previouspage=$_POST['page']-1;
$nextpage=$_POST['page']+1;
$lastpage = ceil($TOTALROWS/$_POST['rows_per_page']);





$paging_control = "<table class='paging'>";

if($_POST['page']>1) {
$paging_control .= "<td><form action='graphs.php' method=POST name='graphquery'> ";
$paging_control .= $propogate;
$paging_control .= "<input type=hidden name=page label='Previous Page' value='{$previouspage}'/>";
$paging_control .= "<input type=submit value='Go To Previous Page' name='Get Again'></form></td>";
}

if($lastpage > 1) {
  $paging_control .= "<td><form action='graphs.php' method=POST name='graphquery'> ";
  $paging_control .= $propogate;
  $paging_control .= "<SELECT name=page>";
  for($i=1;$i<=$lastpage;$i++) {
    $paging_control .=  "<option value='".$i."' ";
    if($i==$_POST['page']) {
      $paging_control .=  " SELECTED ";
    }
    $paging_control .=  ">Page {$i}</option>\n";
  }
  $paging_control .= "</SELECT>\n";
  $paging_control .= "<input type=submit value='Go To Selected Page' name='Get Again'></form></td>";
}


if($_POST['page']<$lastpage) {
$paging_control .= "<td><form action='graphs.php' method=POST name='graphquery'> ";
$paging_control .= $propogate;
$paging_control .= "<input type=hidden name=page label='Next Page' value='{$nextpage}'/>";
$paging_control .= "<input type=submit value='Go To Next Page' name='Get Again'></form></td>";
}
$paging_control .="</table>";





echo "<h2>Found {$TOTALROWS} graph";

if($TOTALROWS!=1)
     echo "s";
echo "</h2><br/>";


echo "<h3>Query:</h3>".$query_pretty."<BR/> <BR/>";



print $paging_control;


// see if any rows were returned 
if (mysql_num_rows($result) > 0) { 
  // print them one after another 
  echo "<table class='results'>"; 
  echo "<thead>";
  $num_fields=mysql_num_fields($result);
     
  foreach ($QUERY['PICTURE'] as $pic)
    echo "<td>".$euphamism_pic[$pic]."</td>";
  
  for($x=0;$x<$num_fields;$x++) {
    if(in_array(mysql_field_name($result,$x),array_map("urldecode",$QUERY['VISIBLE'])))
      echo "<td>".$euphamism[mysql_field_name($result,$x)]."</td>";
  }
  echo "</thead>";
  
  while($row = mysql_fetch_array($result,MYSQL_ASSOC)) { 
    echo "<tr>";
    
    foreach ($QUERY['PICTURE'] as $pic)
      echo "<td><img src='/graph-pics/".urlencode($row[$pic]).".png'></td>";

    foreach ($row as $field => $item) 
      if(in_array($field,array_map("urldecode",$QUERY['VISIBLE'])))
	echo "<td>".$item."</td>";
    
    echo "</tr>"; 
  }
  
  echo "</table>"; 
} 

print $paging_control;
      
// free result set memory 
mysql_free_result($result); 
 
// close connection 
mysql_close($connection); 
 
?> 

</body> 
</html> 
