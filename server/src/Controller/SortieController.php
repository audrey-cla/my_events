<?php

namespace App\Controller;

use App\Repository\SortieRepository;
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

use App\Entity\Sortie;

class SortieController extends AbstractController
{
    /**
     * @Route("/api/sorties", name="all_sorties", methods="GET")
     */
    public function sortieIndex(SortieRepository $sortieRepository)
    {
        $sortie = $sortieRepository->findAll();
        return $this->json($sortie, 200);
    }


    /**
     * @Route("/api/sortie", name="sortie_create", methods="POST")
     */
    public function sortieCreate(Request $request)
    {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : array());
        }
        $sortie = new Sortie();
        $sortie->setEventfulId($data['eventfulId']);
        $sortie->setUserId($data['userId']);
        $sortie->setIsPublic($data['isPublic']);
        $sortie->setGuests($data['guests']);
        $sortie->setNom($data['nom']);
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($sortie);
        $entityManager->flush();
        return $this->json($sortie, 200);
    }

    /**
     * @Route("api/checksortie/{id}", name="sortie_show")
     */

    public function sortie_show($id)
    {
        $sortie = $this->getDoctrine()
            ->getRepository(Sortie::class)
            ->findOneBy(['id' => $id]);

        if (!$sortie) {
            return $this->json('', 200);
        }

        return $this->json($sortie, 200);
    }


    /**
     * @Route("api/checklessorties/{id}", name="sortie_show")
     */

    public function allyour_sorties($id)
    {
        $sortie = $this->getDoctrine()
            ->getRepository(Sortie::class)
            ->findBy(['userId' => $id]);

        if (!$sortie) {
            return $this->json('', 200);
        }

        return $this->json($sortie, 200);
    }


    /**
     * @Route("/api/sortie/{id}", name="sortie_update", methods="PUT")
     */
    public function sortieUpdate(Request $request, SerializerInterface $serializer, SortieRepository $sortieRepository, EntityManagerInterface $em)
    {
        try {
            $jsonContent = $request->getContent();
            $sortie = $sortieRepository->find($request->attributes->get('id'));
            if (!$sortie) return $this->json(["message" => "not found"], 404);

            try {
                $sortie = $serializer->deserialize($jsonContent, Sortie::class, 'json', [AbstractNormalizer::OBJECT_TO_POPULATE => $sortie]);
            } catch (NotEncodableValueException $e) {
                return $this->json(['message' => $e->getMessage()], 400, []);
            }

            $em->persist($sortie);
            $em->flush();

            return $this->json(["message" => "updated", "sortie" => $sortie], 200);
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }
}
