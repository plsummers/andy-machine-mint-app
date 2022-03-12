import styled from "styled-components";

const Container = styled("div")`
    width: 100vw;
    height: auto;
    background-color: #af48ca;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: relative;
`

const Title = styled("h1")`
    margin: 0;
    white-space: nowrap;
`

const Link = styled("a")`
    font-size: 1.5rem;
    margin: 1rem;
    cursor: pointer;
    color: initial;
    text-decoration: none;
    }
`

const Navbar = () => {
    return (
        <Container>
            <Title>
              <Link href="https://soletters.io/">
                Titan Dogs
                </Link>
            </Title>
        </Container>
    )
}

export default Navbar;
