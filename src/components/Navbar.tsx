import styled from "styled-components";

const Container1 = styled("div")`
    width: 100vw;
    height: 20px;
    background-color: #ffffff;

    display: flex;
    justify-content: center;
    align-items: center;
    
    position: relative;
`

const Title1 = styled("h1")`
    margin: 0;
    white-space: nowrap;
     justify-content: center;
    align-items: center;
    position: relative;
`

const Navbar = () => {
    return (
        <Container1>
            <Title1>
              
                SOLETTERS.IO
               
            </Title>
        </Container1>
    )
}

export default Navbar;
