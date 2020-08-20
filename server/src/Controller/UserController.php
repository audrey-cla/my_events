<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\Exception\NotNormalizableValueException;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Entity\User;



class UserController extends AbstractController
{
    /**
     * @Route("/api/users", name="all_users", methods="GET")
     */
    public function userIndex(UserRepository $userRepository)
    {
        $user = $userRepository->findAll();
        return $this->json($user, 200);
    }


    /**
     * @Route("/api/user", name="user_create", methods="POST")
     */
    public function userCreate(Request $request)
    {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : array());
        }
        $user = new User();
        $user->setEmail($data['email']);
        $user->setProfilePic($data['profilePic']);
        $user->setUsername($data['username']);
        $user->setFacebookId($data['facebookId']);
        $user->setBio($data['bio']);
        $user->setName($data['Name']);

        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user, 200);
    }

    /**
     * @Route("api/checkuser/{facebookId}", name="user_show")
     */

    public function user_show($facebookId)
    {
        $user = $this->getDoctrine()
            ->getRepository(User::class)
            ->findOneBy(['facebookId' => $facebookId]);

        if (!$user) {
            return $this->json('', 200);
        }

        return $this->json($user, 200);
    }


    /**
     * @Route("/api/user/{id}", name="user_update", methods="PUT")
     */
    public function userUpdate(Request $request, SerializerInterface $serializer, UserRepository $userRepository, EntityManagerInterface $em)
    {
        try {
            $jsonContent = $request->getContent();
            $user = $userRepository->find($request->attributes->get('id'));
            if (!$user) return $this->json(["message" => "not found"], 404);

            try {
                $user = $serializer->deserialize($jsonContent, User::class, 'json', [AbstractNormalizer::OBJECT_TO_POPULATE => $user]);
            } catch (NotEncodableValueException $e) {
                return $this->json(['message' => $e->getMessage()], 400, []);
            }

            $em->persist($user);
            $em->flush();

            return $this->json(["message" => "updated", "user" => $user], 200);
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }
}
