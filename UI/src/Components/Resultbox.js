import React,{useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

  
const useStyles = makeStyles({
  root: {

        minWidth: "10%",
        maxWidth: "87%",
        marginTop: "7%",
        marginLeft:"-0%",
        paddingLeft: "-30%",
        height:"50%"
        
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function OutlinedCard({ans}) {

  
  const classes = useStyles();


  let docids = ans.toString().split(",")
  return (
    <Card className={classes.root} variant="outlined">
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          <h2 style={{paddingLeft: '25%',color:"green"}}>"List Of Ranked Docs"</h2>
          <hr />
  
        </Typography>
        
        <Typography variant="h5" component="h5">
         
          {docids.map((value) => (
           <strong> <span style={{fontSize:"20px",marginTop:"-1%"}}>{value}{", "}</span> </strong>
      ))}
               
        </Typography>
      </CardContent>
    </Card>
  );
}