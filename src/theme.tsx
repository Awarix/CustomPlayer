import { teal } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';


export const theme = createTheme({
  palette: {
    primary: {
      main: teal[300],
    },
    secondary: {
      main: '#f44336',
    },
  },
});